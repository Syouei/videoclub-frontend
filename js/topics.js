// 话题模块 - 专门处理话题和评论相关的API调用
window.Topics = {
    /**
     * ==================== 话题相关方法 ====================
     */

    /**
     * 创建话题
     * @param {object} topicData - {taskId, title, content/description, scaffold?}
     * @returns {Promise<Object>} 创建结果 {success, data, message}
     */
    async createTopic(topicData) {
        try {
            // ⭐ 关键修复：构建请求数据 - 严格按照API文档
            const requestData = {
                taskId: parseInt(topicData.taskId),  // 必填
                title: topicData.title,               // 必填
                // ⭐ 修复1：前端用description，后端需要content
                content: topicData.content || topicData.description || '',
            };
            
            // ⭐ 修复2：正确处理scaffold字段
            // 只要scaffold有值（非空字符串），就添加到请求中
            if (topicData.scaffold && topicData.scaffold.trim() !== '') {
                requestData.scaffold = topicData.scaffold;
            }

            console.log('[话题模块] 接口请求信息:', requestData);
            const result = await API.createTopic(requestData);
            console.log('[话题模块] 接口返回信息:', result);

            if (result.code === 0) {
                return { 
                    success: true, 
                    data: result.data,
                    message: result.msg || '话题创建成功' 
                };
            }
            
            throw new Error(result.msg || '创建话题失败');
            
        } catch (error) {
            return { 
                success: false, 
                message: error.message || '创建话题失败'
            };
        }
    },

    /**
     * 获取话题列表
     * @param {number} taskId - 任务ID（必填）
     * @param {object} params - 分页参数 {page?, pageSize?}
     * @returns {Promise<Array>} 话题列表
     */
    async getTopics(taskId, params = {}) {
        try {
            console.log('[话题模块] 接口请求信息:', { taskId, params });
            const result = await API.getTopics(taskId, params);
            console.log('[话题模块] 接口返回信息:', result);
            
            if (result.code === 0) {
                const topics = result.data.list || [];
                
                // ⭐⭐⭐ 新增：过滤掉已删除的话题
                const activeTopics = topics.filter(topic => {
                    if (topic.deleted === true || topic.deleted === 1) {
                        return false;
                    }
                    return true;
                });
                
                const formattedTopics = activeTopics.map(topic => ({
                    // 基础字段
                    topicId: topic.topicId,
                    taskId: topic.taskId,
                    title: topic.title,
                    content: topic.content,
                    scaffold: topic.scaffold || null,  // ⭐ 支架字段
                    
                    // 统计字段
                    commentCount: topic.commentCount || 0,
                    isManager: topic.isManager || false,
                    
                    // 时间字段
                    createdAt: topic.createdAt,
                    
                    // 创建者信息
                    creator: topic.creator ? {
                        userId: topic.creator.userId,
                        username: topic.creator.username,
                        realname: topic.creator.realname || topic.creator.username,
                        avatarUrl: topic.creator.avatarUrl || null
                    } : null,
                    
                    // 兼容旧代码的字段
                    creatorId: topic.creator?.userId,
                    creatorName: topic.creator?.realname || topic.creator?.username || '未知',
                    description: topic.content,  // ⭐ 兼容description
                    viewCount: topic.viewCount || 0
                }));

                return formattedTopics;
            }
            
            throw new Error(result.msg || '获取话题列表失败');
            
        } catch (error) {
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
            console.log('[话题模块] 接口请求信息:', { topicId });
            const result = await API.getTopicDetail(topicId);
            console.log('[话题模块] 接口返回信息:', result);
            
            if (result.code === 0 && result.data) {
                const topic = result.data;

                const formattedTopic = {
                    // 基础字段
                    topicId: topic.topicId,
                    taskId: topic.taskId,
                    title: topic.title,
                    content: topic.content,
                    scaffold: topic.scaffold || null,  // ⭐ 支架字段
                    
                    // 统计字段
                    commentCount: topic.commentCount || 0,
                    isManager: topic.isManager || false,
                    
                    // 时间字段
                    createdAt: topic.createdAt,
                    
                    // 创建者信息
                    creator: topic.creator ? {
                        userId: topic.creator.userId,
                        username: topic.creator.username,
                        realname: topic.creator.realname || topic.creator.username,
                        avatarUrl: topic.creator.avatarUrl || null
                    } : null,
                    
                    // 兼容字段
                    creatorId: topic.creator?.userId,
                    creatorName: topic.creator?.realname || topic.creator?.username || '未知',
                    description: topic.content
                };

                return formattedTopic;
            }
            
            throw new Error(result.msg || '获取话题详情失败');
            
        } catch (error) {
            throw error;
        }
    },

    /**
     * 更新话题
     * @param {number} topicId - 话题ID
     * @param {object} topicData - {title?, content/description?, scaffold?}
     * @returns {Promise<Object>} 更新结果 {success, data, message}
     */
    async updateTopic(topicId, topicData) {
        try {
            // 构建请求数据
            const requestData = {};
            
            if (topicData.title !== undefined) {
                requestData.title = topicData.title;
            }
            
            // ⭐ 修复：处理description字段
            if (topicData.content !== undefined) {
                requestData.content = topicData.content;
            } else if (topicData.description !== undefined) {
                requestData.content = topicData.description;
            }
            
            // ⭐ 修复：处理scaffold字段
            if (topicData.scaffold !== undefined) {
                // API文档要求string类型，允许传空字符串表示清空
                requestData.scaffold = topicData.scaffold === null
                    ? ''
                    : String(topicData.scaffold);
            }

            console.log('[话题模块] 接口请求信息:', { topicId, requestData });
            const result = await API.updateTopic(topicId, requestData);
            console.log('[话题模块] 接口返回信息:', result);

            if (result.code === 0) {
                return { 
                    success: true, 
                    data: result.data,
                    message: result.msg || '话题更新成功' 
                };
            }
            
            throw new Error(result.msg || '更新话题失败');
            
        } catch (error) {
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
            console.log('[话题模块] 接口请求信息:', { topicId });
            const result = await API.deleteTopic(topicId);
            console.log('[话题模块] 接口返回信息:', result);

            if (result.code === 0) {
                return { 
                    success: true, 
                    message: result.msg || '话题删除成功' 
                };
            }
            
            // ⭐⭐⭐ 修复：如果是404且话题已删除，也视为成功
            if (result.code === 404) {
                return { 
                    success: true, 
                    message: '该话题已被删除' 
                };
            }
            
            throw new Error(result.msg || '删除话题失败');
            
        } catch (error) {
            // ⭐⭐⭐ 修复：检查错误信息中是否包含"已删除"
            if (error.message && (error.message.includes('404') || error.message.includes('已删除') || error.message.includes('已被删除'))) {
                return { 
                    success: true, 
                    message: '该话题已被删除' 
                };
            }
            
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
    async getTopicComments(topicId, params = {}) {
        try {
            console.log('[话题模块] 接口请求信息:', { topicId, params });
            const result = await API.getTopicComments(topicId, params);
            console.log('[话题模块] 接口返回信息:', result);

            if (result.code === 0) {
                const comments = result.data.list || [];
                
                const formattedComments = comments.map(comment => ({
                    // 基础字段
                    commentId: comment.commentId,
                    topicId: comment.topicId,
                    content: comment.content,
                    parentId: comment.parentId || null,
                    
                    // 点赞信息
                    likeCount: comment.likeCount || 0,
                    isLiked: comment.isLiked || false,
                    
                    // 时间字段
                    createdAt: comment.createdAt,
                    
                    // 用户信息
                    user: comment.user ? {
                        userId: comment.user.userId,
                        username: comment.user.username,
                        realname: comment.user.realname || comment.user.username,
                        avatarUrl: comment.user.avatarUrl || null,
                        role: comment.user.role
                    } : null,
                    
                    // 兼容字段
                    userId: comment.user?.userId,
                    userName: comment.user?.realname || comment.user?.username || '未知',
                    username: comment.user?.username || '未知',
                    userAvatar: comment.user?.avatarUrl,
                    userRole: comment.user?.role,
                    scaffoldType: comment.scaffoldType || null
                }));
                
                
                return formattedComments;
            }
            
            throw new Error(result.msg || '获取评论列表失败');
            
        } catch (error) {
            return [];
        }
    },

    /**
     * 创建话题评论
     * @param {object} commentData - {topicId, content, parentId?}
     * @returns {Promise<Object>} 创建结果 {success, data, message}
     */
    async createTopicComment(commentData) {
        try {
            const topicId = parseInt(commentData.topicId);
            
            const requestData = {
                content: commentData.content
            };
            
            if (commentData.parentId !== undefined && commentData.parentId !== null) {
                requestData.parentId = parseInt(commentData.parentId);
            }

            console.log('[话题模块] 接口请求信息:', { topicId, requestData });
            const result = await API.createTopicComment(topicId, requestData);
            console.log('[话题模块] 接口返回信息:', result);

            if (result.code === 0) {
                return { 
                    success: true, 
                    data: result.data,
                    message: result.msg || '评论发表成功' 
                };
            }
            
            throw new Error(result.msg || '发表评论失败');
            
        } catch (error) {
            return { 
                success: false, 
                message: error.message || '发表评论失败'
            };
        }
    },

    /**
     * 点赞/取消点赞评论
     * @param {number} commentId - 评论ID
     * @returns {Promise<Object>} 点赞结果 {success, liked, message}
     */
    async likeComment(commentId) {
        try {
            console.log('[话题模块] 接口请求信息:', { commentId });
            const result = await API.likeTopicComment(commentId);
            console.log('[话题模块] 接口返回信息:', result);

            if (result.code === 0) {
                const liked = result.data?.liked || false;
                const message = liked ? '点赞成功' : '取消点赞成功';
                
                return { 
                    success: true, 
                    liked: liked,
                    message: result.msg || message
                };
            }
            
            throw new Error(result.msg || '点赞操作失败');
            
        } catch (error) {
            return { 
                success: false, 
                message: error.message || '点赞操作失败'
            };
        }
    },

    /**
     * 删除话题评论
     * @param {number} commentId - 评论ID
     * @returns {Promise<Object>} 删除结果 {success, message}
     */
    async deleteComment(commentId) {
        try {
            console.log('[话题模块] 接口请求信息:', { commentId });
            const result = await API.deleteTopicComment(commentId);
            console.log('[话题模块] 接口返回信息:', result);

            if (result.code === 0) {
                return { 
                    success: true, 
                    message: result.msg || '评论已删除' 
                };
            }
            
            throw new Error(result.msg || '删除评论失败');
            
        } catch (error) {
            return { 
                success: false, 
                message: error.message || '删除评论失败'
            };
        }
    }
};