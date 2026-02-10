(function () {
    // 阿里云 VOD 上传 SDK 的封装
    var AliyunVodUploader = {
        ensureLoaded: function () {
            return new Promise((resolve, reject) => {
                if (window.AliyunUpload && window.AliyunUpload.Vod) {
                    return resolve();
                }
                var s = document.createElement('script');
                s.src = '../js/aliyun-upload-sdk-1.5.7.min.js'; // 确保路径正确
                s.onload = function () {
                    if (window.AliyunUpload && window.AliyunUpload.Vod) {
                        resolve();
                    } else {
                        reject(new Error('阿里云上传SDK加载成功但不可用'));
                    }
                };
                s.onerror = function () {
                    reject(new Error('阿里云上传SDK加载失败'));
                };
                document.head.appendChild(s);
            });
        },

        /**
         * 上传视频
         * @param {File} file - 文件对象
         * @param {Object} token - 后端返回的凭证 { uploadAuth, uploadAddress, videoId }
         * @param {Function} onProgress - 进度回调 (percentage, speed)
         */
        uploadVideo: function (file, token, onProgress) {
            return new Promise((resolve, reject) => {
                if (!window.AliyunUpload || !window.AliyunUpload.Vod) {
                    return reject(new Error('SDK 未加载'));
                }

                // 1. 初始化 Uploader
                var uploader = new window.AliyunUpload.Vod({
                    userId: "123", // 必填，但在 STS 模式下可随意填，主要用于分片存储标识
                    region: "",    // 如果是 cn-shanghai 可不填，其他区域需填写，如 cn-beijing
                    partSize: 1048576, // 分片大小 1MB
                    parallel: 5,       // 并发数
                    retryCount: 3,     // 重试次数
                    retryDuration: 2,  // 重试间隔
                    // 开始上传回调
                    onUploadstarted: function (uploadInfo) {
                        // 【关键】在这里设置凭证
                        if (!uploadInfo.videoId) {
                            // 如果是新上传，SDK 内部可能还没有 videoId，需要从后端凭证中获取
                            // 注意：后端 createUploadVideo 接口返回了 videoId，必须传进去
                            uploader.setUploadAuthAndAddress(
                                uploadInfo,
                                token.uploadAuth,
                                token.uploadAddress,
                                token.videoId // 必须传入后端生成的 videoId
                            );
                        } else {
                            // 如果是凭证过期刷新（暂不处理复杂场景，假设一次成功）
                            uploader.setUploadAuthAndAddress(
                                uploadInfo,
                                token.uploadAuth,
                                token.uploadAddress
                            );
                        }
                    },
                    // 文件上传成功
                    onUploadSucceed: function (uploadInfo) {
                        console.log("上传成功:", uploadInfo);
                        resolve({ videoId: uploadInfo.videoId || token.videoId });
                    },
                    // 文件上传失败
                    onUploadFailed: function (uploadInfo, code, message) {
                        console.error("上传失败:", code, message);
                        reject(new Error(`上传失败: ${message} (${code})`));
                    },
                    // 进度回调
                    onUploadProgress: function (uploadInfo, totalSize, progress) {
                        var progressPercent = Math.ceil(progress * 100);
                        // 估算速度 (SDK 未直接提供 speed，这里简化处理，或者通过前后时间戳计算)
                        var speed = ""; 
                        if (onProgress) {
                            onProgress(progressPercent, speed);
                        }
                    },
                    // 凭证过期（大文件上传时可能触发）
                    onUploadTokenExpired: function (uploadInfo) {
                        console.log("凭证过期，需要刷新...");
                        // 实际业务中需要再次调用后端 /videos/token 刷新，这里简化报错
                        reject(new Error('上传凭证过期，请刷新页面重试'));
                    }
                });

                // 2. 添加文件
                // addFile(file, endpoint, bucket, object, userData) - 后四个参数在 STS 模式下通常传 null 或 JSON
                // 关键：为了让 onUploadstarted 被正确触发并识别文件
                uploader.addFile(file, null, null, null, '{"Vod":{}}');

                // 3. 开始上传
                uploader.start();
            });
        }
    };

    window.AliyunVodUploader = AliyunVodUploader;
})();
