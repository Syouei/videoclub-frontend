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
        
        // 根据API文档，type是可选字段，默认值为 'all'
        // 必须确保type是有效的值之一：watch / research / all
        const apiData = {
            clubId: taskData.clubId,
            title: taskData.title,
            description: taskData.description || '',
            type: 'all'  // 明确设置默认值，确保符合API要求
        };
        
        // 如果有 videoId，也要加上
        if (taskData.videoId) {
            apiData.videoId = taskData.videoId;
        }
        
        console.log('发送给API的任务数据:', apiData);
        
        // 调用API创建任务
        const result = await API.createTask(apiData);
        
        console.log('API创建任务响应:', result);
        
        if (result && result.code === 0) {
            // 任务创建成功
            const createdTask = {
                taskId: result.data.taskId,
                clubId: taskData.clubId,
                title: taskData.title,
                description: taskData.description || '',
                type: result.data.type || 'all',
                createdAt: result.data.createdAt || new Date().toISOString()
            };
            
            console.log('任务创建成功:', createdTask);
            return {
                success: true,
                message: '任务创建成功',
                task: createdTask
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
    getTaskDetail: async function(taskId) {
        console.log('获取任务详情，任务ID:', taskId);
        
        try {
            // 调用API获取任务详情
            const result = await API.getTaskDetail(taskId);
            
            if (result && result.code === 0 && result.data) {
                console.log('获取任务详情成功:', result.data);
                return result.data;
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
    }
};