// 视频播放模块 - 处理视频播放和评论功能
window.VideoPlayer = {
    // 当前视频信息
    currentVideo: null,
    
    // 当前视频的评论列表
    currentComments: [],
    
    // 初始化视频播放模块
    init: function() {
        console.log('视频播放模块初始化');
        return this;
    },
    
    /**
     * 5.5 获取视频详情
     * @param {number} videoId - 视频ID
     * @returns {Promise<object>} 视频详情
     */
    getVideoDetail: async function(videoId) {
        console.log('获取视频详情，视频ID:', videoId);
        
        try {
            const result = await API.getVideoDetail(videoId);
            
            if (result && result.code === 0 && result.data) {
                console.log('获取视频详情成功:', result.data);
                this.currentVideo = result.data;
                return result.data;
            } else {
                console.warn('API返回格式不正确:', result);
                return null;
            }
        } catch (error) {
            console.error('获取视频详情失败:', error);
            return null;
        }
    },
    
    /**
     * 5.4 获取视频列表
     * @param {number} clubId - 俱乐部ID
     * @param {object} params - 查询参数 {page, pageSize}
     * @returns {Promise<Array>} 视频列表
     */
    getClubVideos: async function(clubId, params = {}) {
        console.log('获取俱乐部视频列表，俱乐部ID:', clubId);
        
        try {
            const result = await API.getVideos(clubId, params);
            
            if (result && result.code === 0) {
                const videos = result.data?.list || result.data || [];
                console.log('获取视频列表成功:', videos.length, '个视频');
                return videos;
            } else {
                console.warn('API返回格式不正确:', result);
                return [];
            }
        } catch (error) {
            console.error('获取视频列表失败:', error);
            return [];
        }
    },
    
    /**
     * 6.1 发表评论
     * @param {number} videoId - 视频ID
     * @param {string} content - 评论内容
     * @param {number} videoTime - 视频时间点（秒）
     * @param {number} parentId - 父评论ID（可选，用于回复）
     * @returns {Promise} 发表结果
     */
    postComment: async function(videoId, content, videoTime = 0, parentId = null) {
        console.log('发表评论:', { videoId, content, videoTime, parentId });
        
        // 埋点：发表评论
        if (window.Analytics) {
            window.Analytics.trackFormSubmit('post_comment', { 
                module: 'video', 
                target_object: `video-${videoId}`,
                video_id: videoId,
                video_time: videoTime
            });
        }
        
        try {
            // 验证输入
            if (!content || content.trim() === '') {
                return {
                    success: false,
                    message: '评论内容不能为空'
                };
            }
            
            const commentData = {
                videoId: videoId,
                content: content.trim(),
                videoTime: videoTime || 0
            };
            
            // 如果有父评论ID，添加回复关系
            if (parentId) {
                commentData.parentId = parentId;
            }
            
            const result = await API.postComment(commentData);
            
            if (result && result.code === 0) {
                console.log('评论发表成功:', result.data);
                return {
                    success: true,
                    message: '评论发表成功',
                    comment: result.data
                };
            } else {
                console.error('API返回错误:', result);
                return {
                    success: false,
                    message: result?.msg || '评论发表失败'
                };
            }
        } catch (error) {
            console.error('发表评论失败:', error);
            return {
                success: false,
                message: error.message || '评论发表失败'
            };
        }
    },
    
    /**
     * 6.2 获取视频评论列表
     * @param {number} videoId - 视频ID
     * @param {object} params - 查询参数 {page, pageSize}
     * @returns {Promise<Array>} 评论列表
     */
    getVideoComments: async function(videoId, params = {}) {
        console.log('获取视频评论，视频ID:', videoId);
        
        try {
            const result = await API.getComments(videoId, params);
            
            if (result && result.code === 0) {
                const comments = result.data?.list || result.data || [];
                this.currentComments = comments;
                console.log('获取评论成功:', comments.length, '条评论');
                return comments;
            } else {
                console.warn('API返回格式不正确:', result);
                return [];
            }
        } catch (error) {
            console.error('获取评论失败:', error);
            return [];
        }
    },
    
    /**
     * 6.3 删除评论
     * @param {number} commentId - 评论ID
     * @returns {Promise} 删除结果
     */
    deleteComment: async function(commentId) {
        console.log('删除评论，评论ID:', commentId);
        
        // 埋点：删除评论
        if (window.Analytics) {
            window.Analytics.trackButtonClick('delete_comment', { 
                module: 'video', 
                target_object: `comment-${commentId}`,
                comment_id: commentId
            });
        }
        
        try {
            const result = await API.deleteComment(commentId);
            
            if (result && result.code === 0) {
                console.log('评论删除成功');
                return {
                    success: true,
                    message: '评论已删除'
                };
            } else {
                console.error('API返回错误:', result);
                return {
                    success: false,
                    message: result?.msg || '删除评论失败'
                };
            }
        } catch (error) {
            console.error('删除评论失败:', error);
            return {
                success: false,
                message: error.message || '删除评论失败'
            };
        }
    },
    
    /**
     * 格式化时间（秒 -> mm:ss）
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间
     */
    formatTime: function(seconds) {
        if (!seconds || seconds < 0) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    },
    
    /**
     * 格式化日期
     * @param {string} isoString - ISO日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate: function(isoString) {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleString('zh-CN');
    },
    
    /**
     * 转义HTML特殊字符
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    escapeHtml: function(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
};

// 自动初始化
if (window.App && window.App.initializeApp) {
    // 等待App初始化完成后再初始化VideoPlayer
    document.addEventListener('DOMContentLoaded', function() {
        VideoPlayer.init();
    });
}
