// 任务管理模块 - 适配新的API文档
window.Tasks = {
    // 当前俱乐部的任务列表
    clubTasks: [],
    
    // 当前查看的任务详情
    currentTaskDetail: null,
    
    // 初始化任务模块
    init: function() {
        return this;
    },
    
    /**
     * 7.1 创建任务（发布任务）
     * @param {object} taskData - 任务数据 {clubId, title, description, type}
     * @returns {Promise} {success: boolean, message: string, task: object}
     */
    createTask: async function(taskData) {
    console.log('创建任务，数据:', taskData);
    
    try {
        // 验证必填字段
        if (!taskData.clubId || !taskData.title) {
            throw new Error('俱乐部ID和任务标题是必填项');
        }
        
        const apiData = {
            clubId: taskData.clubId,
            title: taskData.title,
            description: taskData.description || '',
            type: 'all'
        };
        
        // 添加 videoId（如果有）
        if (taskData.videoId !== undefined && taskData.videoId !== null) {
            apiData.videoId = parseInt(taskData.videoId);
        }
        
        // 添加 unlockAt（如果有）
        if (taskData.unlockAt) {
            apiData.unlockAt = taskData.unlockAt;
        }
        
        // 添加 isUnlocked（如果有）
        if (taskData.isUnlocked !== undefined) {
            apiData.isUnlocked = taskData.isUnlocked;
        }
        
        console.log('发送给API的任务数据:', apiData);
        
        // 调用API创建任务
        const result = await API.createTask(apiData);
        
        console.log('API创建任务响应:', result);
        
        if (result && result.code === 0) {
            const createdTask = {
                taskId: result.data.taskId,
                clubId: taskData.clubId,
                title: taskData.title,
                description: taskData.description || '',
                type: result.data.type || 'all',
                videoId: result.data.videoId || taskData.videoId || null, // 添加videoId字段
                createdAt: result.data.createdAt || new Date().toISOString()
            };
            
            console.log('任务创建成功:', createdTask);
            return {
                success: true,
                message: '任务创建成功',
                task: createdTask
            };
        } else if (result && result.code === 403) {
            // 权限错误（HTTP 403 Forbidden）
            return {
                success: false,
                message: '权限不足：只有俱乐部管理员可以创建任务',
                code: 'PERMISSION_DENIED'
            };
        } else {
            console.error('API返回错误:', result);
            return {
                success: false,
                message: result?.msg || '创建任务失败'
            };
        }
        
    } catch (error) {
        console.error('创建任务失败:', error);
        return {
            success: false,
            message: error.message || '创建任务失败'
        };
    }
},
    
    /**
     * 7.3 获取俱乐部任务列表
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise<Array>} 任务列表
     */
    getClubTasks: async function(clubId) {
        console.log('获取俱乐部任务列表，俱乐部ID:', clubId);
        
        try {
            // 调用API获取任务列表
            const result = await API.getTasks(clubId);
            
            if (result && result.code === 0 && Array.isArray(result.data)) {
                console.log('获取俱乐部任务成功:', result.data.length, '个任务');
                return result.data;
            } else {
                console.warn('API返回格式不正确:', result);
                return [];
            }
        } catch (error) {
            console.error('获取俱乐部任务列表失败:', error);
            return [];
        }
    },
    
    /**
     * 7.4 获取任务详情
     * @param {number} taskId - 任务ID
     * @returns {Promise<object>} 任务详情
     */
    // 在 getTaskDetail 方法中添加或修改子任务逻辑
getTaskDetail: async function(taskId) {
    console.log('获取任务详情，任务ID:', taskId);
    
    try {
        // 调用API获取任务详情
        const result = await API.getTaskDetail(taskId);
        
        if (result && result.code === 0 && result.data) {
            console.log('获取任务详情成功:', result.data);
            
            // 添加"阅读教学设计"子任务到任务详情中
            const taskDetail = result.data;
            if (taskDetail.taskInfo && Array.isArray(taskDetail.taskInfo.subTasks)) {
                // 检查是否已经包含阅读教学设计子任务
                const hasReadDesignTask = taskDetail.taskInfo.subTasks.some(
                    subtask => subtask.type === 'read_design'
                );
                
                if (!hasReadDesignTask) {
                    // 添加"阅读教学设计"子任务作为第一个子任务
                    taskDetail.taskInfo.subTasks.unshift({
                        subtaskId: 0, // 使用0作为教学设计子任务的ID
                        title: "阅读教学设计",
                        type: "read_design",
                        description: "阅读并理解本课的教学设计方案",
                        status: "incomplete",
                        order: 0 // 确保这是第一个子任务
                    });
                    
                    // 重新排序其他子任务
                    taskDetail.taskInfo.subTasks.forEach((subtask, index) => {
                        if (subtask.type !== 'read_design') {
                            subtask.order = index;
                        }
                    });
                }
            }
            
            return taskDetail;
        } else {
            console.warn('API返回格式不正确:', result);
            return null;
        }
    } catch (error) {
        console.error('获取任务详情失败:', error);
        return null;
    }
},
    
    /**
     * 7.2 提交子任务完成
     * @param {number} taskId - 任务ID
     * @param {number} subtaskId - 子任务ID (1:看视频, 2:研视频)
     * @param {object} completionData - 完成数据
     * @returns {Promise} 提交结果
     */
    completeSubTask: async function(taskId, subtaskId, completionData = {}) {
        console.log('提交子任务完成:', { taskId, subtaskId, completionData });
        
        try {
            // 调用API提交子任务
            const result = await API.completeSubTask(taskId, subtaskId, completionData);
            
            if (result && result.code === 0) {
                console.log('子任务提交成功');
                return {
                    success: true,
                    message: '任务提交成功'
                };
            } else {
                console.error('API返回错误:', result);
                return {
                    success: false,
                    message: result?.msg || '提交任务失败'
                };
            }
        } catch (error) {
            console.error('提交子任务失败:', error);
            return {
                success: false,
                message: error.message || '提交任务失败'
            };
        }
    },
    
    /**
     * 设置当前任务（进入tasks.html时调用）
     * @param {number} taskId - 任务ID
     * @returns {Promise<object>} 任务详情
     */
    setCurrentTask: async function(taskId) {
        console.log('设置当前任务，任务ID:', taskId);
        
        // 获取任务详情
        const taskDetail = await this.getTaskDetail(taskId);
        
        if (taskDetail) {
            this.currentTaskDetail = taskDetail;
            console.log('当前任务设置成功:', taskDetail.taskInfo.title);
        } else {
            console.warn('获取任务详情失败');
            this.currentTaskDetail = null;
        }
        
        return this.currentTaskDetail;
    },
    
    /**
     * 获取当前任务详情
     * @returns {object} 当前任务详情
     */
    getCurrentTaskDetail: function() {
        return this.currentTaskDetail;
    },

    /**
 * 7.5 修改任务
 * @param {number} taskId - 任务ID
 * @param {object} taskData - 更新的任务数据
 * @returns {Promise} 修改结果
 */
updateTask: async function(taskId, taskData) {
    console.log('修改任务，任务ID:', taskId, '数据:', taskData);
    
    try {
        // 调用API修改任务
        const result = await API.updateTask(taskId, taskData);
        
        if (result && result.code === 0) {
            console.log('任务修改成功');
            return {
                success: true,
                message: '任务修改成功'
            };
        } else {
            console.error('API返回错误:', result);
            return {
                success: false,
                message: result?.msg || '修改任务失败'
            };
        }
    } catch (error) {
        console.error('修改任务失败:', error);
        return {
            success: false,
            message: error.message || '修改任务失败'
        };
    }
},

/**
 * 7.6 删除任务
 * @param {number} taskId - 任务ID
 * @returns {Promise} 删除结果
 */
deleteTask: async function(taskId) {
    console.log('删除任务，任务ID:', taskId);
    
    try {
        // 调用API删除任务
        const result = await API.deleteTask(taskId);
        
        if (result && result.code === 0) {
            console.log('任务删除成功');
            return {
                success: true,
                message: '任务删除成功'
            };
        } else {
            console.error('API返回错误:', result);
            return {
                success: false,
                message: result?.msg || '删除任务失败'
            };
        }
    } catch (error) {
        console.error('删除任务失败:', error);
        return {
            success: false,
            message: error.message || '删除任务失败'
        };
    }
},
/**
 * 检查任务是否已完成（两个子任务都完成）
 * @param {number} taskId - 任务ID
 * @returns {Promise<boolean>} 是否已完成
 */
isTaskCompleted: async function(taskId) {
    try {
        const taskDetail = await this.getTaskDetail(taskId);
        
        if (!taskDetail || !taskDetail.taskInfo || !Array.isArray(taskDetail.taskInfo.subTasks)) {
            return false;
        }
        
        const subTasks = taskDetail.taskInfo.subTasks;
        const watchTask = subTasks.find(st => st.type === 'watch');
        const researchTask = subTasks.find(st => st.type === 'research');
        
        // 两个子任务都必须完成
        return watchTask && watchTask.status === 'completed' && 
               researchTask && researchTask.status === 'completed';
    } catch (error) {
        console.error('检查任务完成状态失败:', error);
        return false;
    }
},

// ========== 话题管理功能 ==========

/**
 * 创建话题
 * @param {object} topicData - 话题数据 {taskId, title, description}
 * @returns {Promise} {success: boolean, message: string, topic: object}
 */
createTopic: async function(topicData) {
    console.log('创建话题，数据:', topicData);
    
    try {
        // 验证必填字段
        if (!topicData.taskId || !topicData.title) {
            throw new Error('任务ID和话题标题是必填项');
        }
        
        // 调用API创建话题
        const result = await API.createTopic(topicData);
        
        if (result && result.code === 0) {
            console.log('话题创建成功:', result.data);
            return {
                success: true,
                message: '话题创建成功',
                topic: result.data
            };
        } else if (result && result.code === 403) {
            return {
                success: false,
                message: '权限不足：只有俱乐部管理员可以创建话题',
                code: 'PERMISSION_DENIED'
            };
        } else {
            console.error('API返回错误:', result);
            return {
                success: false,
                message: result?.msg || '创建话题失败'
            };
        }
    } catch (error) {
        console.error('创建话题失败:', error);
        return {
            success: false,
            message: error.message || '创建话题失败'
        };
    }
},

/**
 * 获取任务的话题列表
 * @param {number} taskId - 任务ID
 * @returns {Promise<Array>} 话题列表
 */
getTopics: async function(taskId) {
    console.log('获取话题列表，任务ID:', taskId);
    
    try {
        // 调用API获取话题列表
        const result = await API.getTopics(taskId);
        
        if (result && result.code === 0 && Array.isArray(result.data)) {
            console.log('获取话题列表成功:', result.data.length, '个话题');
            return result.data;
        } else {
            console.warn('API返回格式不正确:', result);
            return [];
        }
    } catch (error) {
        console.error('获取话题列表失败:', error);
        return [];
    }
},

/**
 * 获取话题详情
 * @param {number} topicId - 话题ID
 * @returns {Promise<object>} 话题详情
 */
getTopicDetail: async function(topicId) {
    console.log('获取话题详情，话题ID:', topicId);
    
    try {
        // 调用API获取话题详情
        const result = await API.getTopicDetail(topicId);
        
        if (result && result.code === 0 && result.data) {
            console.log('获取话题详情成功:', result.data);
            return result.data;
        } else {
            console.warn('API返回格式不正确:', result);
            return null;
        }
    } catch (error) {
        console.error('获取话题详情失败:', error);
        return null;
    }
},

/**
 * 更新话题
 * @param {number} topicId - 话题ID
 * @param {object} topicData - 更新的话题数据
 * @returns {Promise} 更新结果
 */
updateTopic: async function(topicId, topicData) {
    console.log('更新话题，话题ID:', topicId, '数据:', topicData);
    
    try {
        // 调用API更新话题
        const result = await API.updateTopic(topicId, topicData);
        
        if (result && result.code === 0) {
            console.log('话题更新成功');
            return {
                success: true,
                message: '话题更新成功'
            };
        } else {
            console.error('API返回错误:', result);
            return {
                success: false,
                message: result?.msg || '更新话题失败'
            };
        }
    } catch (error) {
        console.error('更新话题失败:', error);
        return {
            success: false,
            message: error.message || '更新话题失败'
        };
    }
},

/**
 * 删除话题
 * @param {number} topicId - 话题ID
 * @returns {Promise} 删除结果
 */
deleteTopic: async function(topicId) {
    console.log('删除话题，话题ID:', topicId);
    
    try {
        // 调用API删除话题
        const result = await API.deleteTopic(topicId);
        
        if (result && result.code === 0) {
            console.log('话题删除成功');
            return {
                success: true,
                message: '话题删除成功'
            };
        } else {
            console.error('API返回错误:', result);
            return {
                success: false,
                message: result?.msg || '删除话题失败'
            };
        }
    } catch (error) {
        console.error('删除话题失败:', error);
        return {
            success: false,
            message: error.message || '删除话题失败'
        };
    }
},

/**
 * 获取话题的评论列表
 * @param {number} topicId - 话题ID
 * @returns {Promise<Array>} 评论列表
 */
getTopicComments: async function(topicId) {
    console.log('获取话题评论列表，话题ID:', topicId);
    
    try {
        // 调用API获取评论列表
        const result = await API.getTopicComments(topicId);
        
        if (result && result.code === 0 && Array.isArray(result.data)) {
            console.log('获取评论列表成功:', result.data.length, '条评论');
            return result.data;
        } else {
            console.warn('API返回格式不正确:', result);
            return [];
        }
    } catch (error) {
        console.error('获取评论列表失败:', error);
        return [];
    }
},

/**
 * 创建话题评论
 * @param {object} commentData - 评论数据 {topicId, content, scaffoldType}
 * @returns {Promise} 创建结果
 */
createTopicComment: async function(commentData) {
    console.log('创建话题评论，数据:', commentData);
    
    try {
        // 验证必填字段
        if (!commentData.topicId || !commentData.content) {
            throw new Error('话题ID和评论内容是必填项');
        }
        
        // 调用API创建评论
        const result = await API.createTopicComment(commentData);
        
        if (result && result.code === 0) {
            console.log('评论创建成功:', result.data);
            return {
                success: true,
                message: '评论发布成功',
                comment: result.data
            };
        } else {
            console.error('API返回错误:', result);
            return {
                success: false,
                message: result?.msg || '发布评论失败'
            };
        }
    } catch (error) {
        console.error('创建评论失败:', error);
        return {
            success: false,
            message: error.message || '发布评论失败'
        };
    }
}
};