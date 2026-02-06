// 话题模块 - 专门处理话题和评论相关的API调用
window.Topics = {
    /**
     * ==================== 话题相关方法 ====================
     */

    /**
     * 创建话题
     * @param {object} topicData - {taskId, title, content/description}
     * @returns {Promise<Object>} 创建结果 {success, data, message}
     */
    async createTopic(topicData) {
        try {
            console.log('[Topics] 创建话题请求:', topicData);
            
            // 确保数据格式正确 - 按照API文档，后端需要content字段
            const requestData = {
                taskId: parseInt(topicData.taskId),
                title: topicData.title,
                content: topicData.content || topicData.description || ''
            };
            
            const result = await API.createTopic(requestData);
            
            if (result.code === 0) {
                console.log('[Topics] 创建话题成功:', result.data);
                return { 
                    success: true, 
                    data: result.data, 
                    message: result.msg || '话题创建成功' 
                };
            }
            
            throw new Error(result.msg || '创建话题失败');
            
        } catch (error) {
            console.error('[Topics] 创建话题失败:', error);
            return { 
                success: false, 
                message: error.message || '创建话题失败'
            };
        }
    },

    /**
     * 获取话题列表
     * @param {number} taskId - 任务ID
     * @param {object} params - 分页参数 {page?, pageSize?}
     * @returns {Promise<Array>} 话题列表
     */
    async getTopics(taskId, params = {}) {
        try {
            console.log('[Topics] 获取话题列表请求:', taskId);
            
            const result = await API.getTopics(taskId, params);
            
            if (result.code === 0) {
                // 处理返回数据
                const topics = result.data.list || result.data || [];
                
                // 适配前端需要的字段格式
                const formattedTopics = topics.map(topic => ({
                    topicId: topic.topicId,
                    taskId: topic.taskId,
                    title: topic.title,
                    content: topic.content,
                    description: topic.content, // 兼容前端使用description的地方
                    commentCount: topic.commentCount || 0,
                    createdAt: topic.createdAt,
                    creatorId: topic.creatorId || topic.creator?.userId,
                    creatorName: topic.creator?.username || '未知',
                    viewCount: topic.viewCount || 0
                }));
                
                console.log('[Topics] 获取话题列表成功:', formattedTopics.length);
                return formattedTopics;
            }
            
            throw new Error(result.msg || '获取话题列表失败');
            
        } catch (error) {
            console.error('[Topics] 获取话题列表失败:', error);
            // 返回空数组而不是抛出错误，避免页面崩溃
            return [];
        }
    },

    /**
     * 获取话题详情
     * @param {number} topicId - 话题ID
     * @returns {Promise<Object>} 话题详情
     */
    async getTopicDetail(topicId) {
        try {
            console.log('[Topics] 获取话题详情请求:', topicId);
            
            const result = await API.getTopicDetail(topicId);
            
            if (result.code === 0 && result.data) {
                // 适配字段：content → description
                const topic = {
                    ...result.data,
                    description: result.data.content // 兼容前端使用description
                };
                console.log('[Topics] 获取话题详情成功');
                return topic;
            }
            
            throw new Error(result.msg || '获取话题详情失败');
            
        } catch (error) {
            console.error('[Topics] 获取话题详情失败:', error);
            throw error;
        }
    },

    /**
     * 更新话题
     * @param {number} topicId - 话题ID
     * @param {object} topicData - {title?, content/description?}
     * @returns {Promise<Object>} 更新结果 {success, data, message}
     */
    async updateTopic(topicId, topicData) {
        try {
            console.log('[Topics] 更新话题请求:', topicId, topicData);
            
            // 转换字段：description → content
            const requestData = {};
            if (topicData.title) {
                requestData.title = topicData.title;
            }
            if (topicData.content !== undefined || topicData.description !== undefined) {
                requestData.content = topicData.content || topicData.description || '';
            }
            
            const result = await API.updateTopic(topicId, requestData);
            
            if (result.code === 0) {
                console.log('[Topics] 更新话题成功');
                return { 
                    success: true, 
                    data: result.data, 
                    message: result.msg || '话题更新成功' 
                };
            }
            
            throw new Error(result.msg || '更新话题失败');
            
        } catch (error) {
            console.error('[Topics] 更新话题失败:', error);
            return { 
                success: false, 
                message: error.message || '更新话题失败'
            };
        }
    },

    /**
     * 删除话题
     * @param {number} topicId - 话题ID
     * @returns {Promise<Object>} 删除结果 {success, message}
     */
    async deleteTopic(topicId) {
        try {
            console.log('[Topics] 删除话题请求:', topicId);
            
            const result = await API.deleteTopic(topicId);
            
            if (result.code === 0) {
                console.log('[Topics] 删除话题成功');
                return { 
                    success: true, 
                    message: result.msg || '话题删除成功' 
                };
            }
            
            throw new Error(result.msg || '删除话题失败');
            
        } catch (error) {
            console.error('[Topics] 删除话题失败:', error);
            return { 
                success: false, 
                message: error.message || '删除话题失败'
            };
        }
    },

    /**
     * ==================== 评论相关方法 ====================
     */

    /**
     * 获取话题评论列表
     * @param {number} topicId - 话题ID
     * @param {object} params - 分页参数 {page?, pageSize?}
     * @returns {Promise<Array>} 评论列表
     */
    // 在 topics.js 的 getTopicComments 方法中修改：
async getTopicComments(topicId, params = {}) {
    try {
        console.log('[Topics] 获取评论列表请求:', topicId);
        
        const result = await API.getTopicComments(topicId, params);
        
        if (result.code === 0) {
            const comments = result.data.list || result.data || [];
            
            // 适配前端字段
            const formattedComments = comments.map(comment => ({
                commentId: comment.commentId,
                topicId: comment.topicId,
                content: comment.content,
                parentId: comment.parentId,
                likeCount: comment.likeCount || 0,
                isLiked: comment.isLiked || false,
                createdAt: comment.createdAt,
                userId: comment.user?.userId || comment.userId,
                // 修改这里：优先显示真实姓名，如果没有则显示用户名
                userName: comment.user?.realname || comment.user?.username || '未知',
                username: comment.user?.username || '未知', // 保留用户名字段
                userAvatar: comment.user?.avatarUrl,
                userRole: comment.user?.role,
                scaffoldType: comment.scaffoldType || '观点'
            }));
            
            console.log('[Topics] 获取评论列表成功:', formattedComments.length);
            return formattedComments;
        }
        
        throw new Error(result.msg || '获取评论列表失败');
        
    } catch (error) {
        console.error('[Topics] 获取评论列表失败:', error);
        return [];
    }
},

    /**
     * 创建话题评论
     * @param {object} commentData - {topicId, content, parentId?, scaffoldType?}
     * @returns {Promise<Object>} 创建结果 {success, data, message}
     */
    async createTopicComment(commentData) {
        try {
            console.log('[Topics] 创建评论请求:', commentData);
            
            const topicId = parseInt(commentData.topicId);
            const requestData = {
                content: commentData.content
            };
            
            if (commentData.parentId) {
                requestData.parentId = parseInt(commentData.parentId);
            }
            
            const result = await API.createTopicComment(topicId, requestData);
            
            if (result.code === 0) {
                console.log('[Topics] 创建评论成功');
                return { 
                    success: true, 
                    data: result.data, 
                    message: result.msg || '评论发表成功' 
                };
            }
            
            throw new Error(result.msg || '发表评论失败');
            
        } catch (error) {
            console.error('[Topics] 创建评论失败:', error);
            return { 
                success: false, 
                message: error.message || '发表评论失败'
            };
        }
    },

    /**
     * 点赞评论
     * @param {number} commentId - 评论ID
     * @returns {Promise<Object>} 点赞结果 {success, liked, message}
     */
    async likeComment(commentId) {
        try {
            console.log('[Topics] 点赞评论请求:', commentId);
            
            const result = await API.likeTopicComment(commentId);
            
            if (result.code === 0) {
                console.log('[Topics] 点赞操作成功');
                return { 
                    success: true, 
                    liked: result.data?.liked !== false, // 默认为true
                    message: result.msg || (result.data?.liked ? '点赞成功' : '取消点赞成功')
                };
            }
            
            throw new Error(result.msg || '点赞操作失败');
            
        } catch (error) {
            console.error('[Topics] 点赞操作失败:', error);
            return { 
                success: false, 
                message: error.message || '点赞操作失败'
            };
        }
    }
};