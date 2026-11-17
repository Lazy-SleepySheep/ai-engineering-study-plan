# System Design

## 2026-11-13 16:56

1xx · 连接与协议
- 100 Continue：服务器允许客户端继续发送请求体。常见于客户端用 Expect: 100-continue 先询问是否可以上传大文件。
- 101 Switching Protocols：同意切换协议，例如通过 HTTP/1.1 握手升级到 WebSocket。RFC 9110 · 1xx
2xx · 成功
- 200 OK：请求成功。比如查询订单，或更新订单后返回更新后的数据。
- 201 Created：资源已创建。比如下单成功，可以用 Location: /orders/123 告诉客户端新订单的位置。
- 202 Accepted：请求已接受，处理尚未完成。比如提交视频转码，返回 jobId 和状态查询地址。
- 204 No Content：操作成功，响应没有正文。比如删除收藏成功。
- 206 Partial Content：返回客户端通过 Range 请求的部分内容。常用于视频拖动播放和断点续传。RFC 9110 · 2xx
3xx · 重定向与缓存
- 301 Moved Permanently：永久跳转。比如网站换域名。
- 302 Found：临时跳转。比如访问短链时，通过 Location 跳到长网址。
- 303 See Other：引导客户端去另一个地址读取结果。典型场景是 POST 提交表单后，用 GET 打开结果页。
- 304 Not Modified：条件请求发现资源没变，客户端可以继续用缓存。比如请求带 If-None-Match，服务器发现 ETag 仍匹配，就返回 304，省掉响应正文。
- 307 Temporary Redirect：临时跳转，保留原请求方法。比如 POST 跳转后仍然是 POST。
- 308 Permanent Redirect：永久跳转，保留原请求方法。
面试追问常在这里：301 和 302 允许客户端把 POST 改成 GET。如果必须保留 POST，临时用 307，永久用 308。 RFC 9110 · 3xx
4xx · 请求、权限与资源状态
- 400 Bad Request：请求有问题。比如 JSON 格式错误。
- 401 Unauthorized：缺少有效身份凭证。比如没带 Token，或 Token 已过期。
- 403 Forbidden：服务器理解请求，但拒绝执行。典型例子是用户已登录，却没有权限删除团队项目。
- 404 Not Found：资源找不到。比如订单 ID 不存在。出于权限考虑，服务也可以用 404 隐藏资源是否存在。
- 405 Method Not Allowed：这个资源不支持请求使用的方法。比如只支持 GET 的接口收到了 POST。
- 408 Request Timeout：服务器没能在等待时间内收到完整的客户端请求。
- 409 Conflict：请求和资源当前状态冲突。比如短链 alias 已被占用，或者订单状态已变化，当前操作无法执行。
- 410 Gone：资源已被移除，且预计永久不可用。比如明确永久下线的公开页面。
- 412 Precondition Failed：请求声明的前置条件不成立。比如 If-Match 携带旧 ETag，服务器拒绝覆盖更新后的文档。
- 413 Content Too Large：请求体太大。比如上传文件超过大小限制。
- 415 Unsupported Media Type：接口不支持请求体的媒体类型。比如只接收 application/json，客户端却发了 text/plain。
- 416 Range Not Satisfiable：请求的字节范围无法满足。比如从一个 1 MB 文件的第 2 MB 开始下载。
- 422 Unprocessable Content：服务器理解内容类型，语法也正确，但无法执行其中的指令。比如 JSON 合法，`startDate` 却晚于 endDate。有些 API 会统一用 400 返回校验错误。
- 428 Precondition Required：服务器要求请求带前置条件。比如更新文档必须带 If-Match。没带可以返回 428，带了但不匹配返回 412。
- 429 Too Many Requests：触发限流。比如用户超过每分钟 100 次请求的配额。可以用 Retry-After 告诉客户端多久后再试。RFC 9110 · 4xx · RFC 6585 · 428 和 429
5xx · 服务端与网关故障
- 500 Internal Server Error：服务遇到未预期的错误，无法完成请求。比如代码抛出未处理异常。
- 501 Not Implemented：服务器未实现完成请求所需的功能。比如服务器根本不认识这个 HTTP 方法。某个资源不支持一个服务器认识的方法时，通常用 405。
- 502 Bad Gateway：网关或代理收到了无效的上游响应。
- 503 Service Unavailable：服务暂时无法处理请求。比如过载或维护。可以用 Retry-After 指示重试时间。
- 504 Gateway Timeout：网关或代理没有及时收到上游响应。比如 API Gateway 等待订单服务超时。RFC 9110 · 5xx
面试时最值得练的是这几组：201 已创建 / 202 待处理，401 凭证无效 / 403 拒绝访问，409 状态冲突 / 412 条件失败，429 请求方触发限流 / 503 服务暂时不可用，以及 502 上游响应无效 / 504 等上游超时。能用你正在设计的 API 举例，就能把状态码和系统行为一起讲清楚。

## 2026-11-13 18:04

In an interview, the key distinction to make is: virtual nodes prevent structural imbalance (uneven key distribution), while replication and key salting prevent workload imbalance (uneven traffic).
