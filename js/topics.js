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
            console.log('[Topics] 📝 创建话题请求:', topicData);
            
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
            
            console.log('[Topics] 🚀 发送给后端的数据:', requestData);
            console.log('[Topics] 🔍 scaffold字段:', requestData.scaffold);
            
            const result = await API.createTopic(requestData);
            
            console.log('[Topics] 📥 后端返回的数据:', result);
            
            if (result.code === 0) {
                console.log('[Topics] ✅ 创建话题成功!');
                console.log('[Topics] 🔍 返回的scaffold:', result.data?.scaffold);
                return { 
                    success: true, 
                    data: result.data,
                    message: result.msg || '话题创建成功' 
                };
            }
            
            throw new Error(result.msg || '创建话题失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 创建话题失败:', error);
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
            console.log('[Topics] 📋 获取话题列表请求:', { taskId, params });
            
            const result = await API.getTopics(taskId, params);
            
            // ⭐ 超详细日志：查看后端返回的完整数据
            console.log('[Topics] 📥 后端返回的完整响应:');
            console.log(JSON.stringify(result, null, 2));
            
            if (result.code === 0) {
                const topics = result.data.list || [];
                
                // ⭐⭐⭐ 新增：过滤掉已删除的话题
                const activeTopics = topics.filter(topic => {
                    if (topic.deleted === true || topic.deleted === 1) {
                        console.warn('[Topics] ⚠️ 过滤已删除话题:', topic.topicId, topic.title);
                        return false;
                    }
                    return true;
                });
                
                console.log('[Topics] 📋 原始话题数量:', topics.length);
                console.log('[Topics] 📋 过滤后话题数量:', activeTopics.length);
                console.log('[Topics] 📋 已删除话题数:', topics.length - activeTopics.length);
                
                // ⭐ 查看每个话题的原始数据
                activeTopics.forEach((topic, index) => {
                    console.log(`[Topics] 🔍 话题${index + 1}完整数据:`, JSON.stringify(topic, null, 2));
                    console.log(`[Topics] 🔍 话题${index + 1} - topicId:`, topic.topicId);
                    console.log(`[Topics] 🔍 话题${index + 1} - title:`, topic.title);
                    console.log(`[Topics] 🔍 话题${index + 1} - scaffold类型:`, typeof topic.scaffold);
                    console.log(`[Topics] 🔍 话题${index + 1} - scaffold值:`, topic.scaffold);
                    console.log(`[Topics] 🔍 话题${index + 1} - scaffold是否为null:`, topic.scaffold === null);
                    console.log(`[Topics] 🔍 话题${index + 1} - scaffold是否为undefined:`, topic.scaffold === undefined);
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
                
                const scaffoldCount = formattedTopics.filter(t => t.scaffold).length;
                console.log('[Topics] ✅ 获取话题列表成功，共', formattedTopics.length, '条，其中', scaffoldCount, '条有支架');
                
                if (scaffoldCount === 0 && activeTopics.length > 0) {
                    console.warn('[Topics] ⚠️ 警告：所有话题的scaffold都是null！请检查后端是否正确返回scaffold字段！');
                }
                
                return formattedTopics;
            }
            
            throw new Error(result.msg || '获取话题列表失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 获取话题列表失败:', error);
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
            console.log('[Topics] 📄 获取话题详情请求:', topicId);
            
            const result = await API.getTopicDetail(topicId);
            
            console.log('[Topics] 📥 后端返回的详情数据:');
            console.log(JSON.stringify(result, null, 2));
            
            if (result.code === 0 && result.data) {
                const topic = result.data;
                
                console.log('[Topics] 🔍 话题详情 - scaffold类型:', typeof topic.scaffold);
                console.log('[Topics] 🔍 话题详情 - scaffold值:', topic.scaffold);
                
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
                
                console.log('[Topics] ✅ 获取话题详情成功');
                console.log('[Topics] 🔍 格式化后的scaffold:', formattedTopic.scaffold);
                
                if (!formattedTopic.scaffold) {
                    console.warn('[Topics] ⚠️ 警告：该话题没有scaffold字段！');
                }
                
                return formattedTopic;
            }
            
            throw new Error(result.msg || '获取话题详情失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 获取话题详情失败:', error);
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
            console.log('[Topics] 📝 更新话题请求:', { topicId, topicData });
            
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
                // 如果有值就传，空字符串传null（表示删除）
                requestData.scaffold = topicData.scaffold && topicData.scaffold.trim() !== '' 
                    ? topicData.scaffold 
                    : null;
            }
            
            console.log('[Topics] 🚀 发送给后端的更新数据:', requestData);
            console.log('[Topics] 🔍 更新的scaffold:', requestData.scaffold);
            
            const result = await API.updateTopic(topicId, requestData);
            
            console.log('[Topics] 📥 后端返回的更新结果:', result);
            
            if (result.code === 0) {
                console.log('[Topics] ✅ 更新话题成功');
                console.log('[Topics] 🔍 更新后的scaffold:', result.data?.scaffold);
                return { 
                    success: true, 
                    data: result.data,
                    message: result.msg || '话题更新成功' 
                };
            }
            
            throw new Error(result.msg || '更新话题失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 更新话题失败:', error);
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
            console.log('[Topics] 🗑️ 删除话题请求:', topicId);
            
            const result = await API.deleteTopic(topicId);
            
            console.log('[Topics] 📥 删除话题响应:', result);
            
            if (result.code === 0) {
                console.log('[Topics] ✅ 删除话题成功');
                return { 
                    success: true, 
                    message: result.msg || '话题删除成功' 
                };
            }
            
            // ⭐⭐⭐ 修复：如果是404且话题已删除，也视为成功
            if (result.code === 404) {
                console.warn('[Topics] ⚠️ 话题已被删除');
                return { 
                    success: true, 
                    message: '该话题已被删除' 
                };
            }
            
            throw new Error(result.msg || '删除话题失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 删除话题失败:', error);
            
            // ⭐⭐⭐ 修复：检查错误信息中是否包含"已删除"
            if (error.message && (error.message.includes('404') || error.message.includes('已删除') || error.message.includes('已被删除'))) {
                console.warn('[Topics] ⚠️ 话题已被软删除');
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
            console.log('[Topics] 💬 获取评论列表请求:', { topicId, params });
            
            const result = await API.getTopicComments(topicId, params);
            
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
                
                console.log('[Topics] ✅ 获取评论列表成功:', formattedComments.length, '条');
                
                return formattedComments;
            }
            
            throw new Error(result.msg || '获取评论列表失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 获取评论列表失败:', error);
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
            console.log('[Topics] 💬 创建评论请求:', commentData);
            
            const topicId = parseInt(commentData.topicId);
            
            const requestData = {
                content: commentData.content
            };
            
            if (commentData.parentId !== undefined && commentData.parentId !== null) {
                requestData.parentId = parseInt(commentData.parentId);
            }
            
            const result = await API.createTopicComment(topicId, requestData);
            
            if (result.code === 0) {
                console.log('[Topics] ✅ 创建评论成功');
                return { 
                    success: true, 
                    data: result.data,
                    message: result.msg || '评论发表成功' 
                };
            }
            
            throw new Error(result.msg || '发表评论失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 创建评论失败:', error);
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
            console.log('[Topics] 👍 点赞评论请求:', commentId);
            
            const result = await API.likeTopicComment(commentId);
            
            if (result.code === 0) {
                const liked = result.data?.liked || false;
                const message = liked ? '点赞成功' : '取消点赞成功';
                
                console.log('[Topics] ✅ 点赞操作成功:', { liked });
                return { 
                    success: true, 
                    liked: liked,
                    message: result.msg || message
                };
            }
            
            throw new Error(result.msg || '点赞操作失败');
            
        } catch (error) {
            console.error('[Topics] ❌ 点赞操作失败:', error);
            return { 
                success: false, 
                message: error.message || '点赞操作失败'
            };
        }
    }
};