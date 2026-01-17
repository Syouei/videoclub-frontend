// 任务管理模块 - 增强版，支持API持久化
window.Tasks = {
    // 视频任务数据
    videoTasks: {},
    
    // 当前视频
    currentVideo: null,
    
    // 当前任务列表
    currentTasks: [],
    
    // 初始化任务模块
    init: function() {
        this.loadTasksFromStorage();
        return this;
    },
    
    // 从本地存储加载任务数据
    loadTasksFromStorage: function() {
        try {
            const tasksData = Utils.getFromStorage(AppConfig.STORAGE_KEYS.TASKS_CACHE);
            if (tasksData && tasksData.videoTasks) {
                this.videoTasks = tasksData.videoTasks;
                console.log('从本地存储加载任务数据');
                return true;
            }
        } catch (error) {
            console.error('加载任务数据失败:', error);
        }
        
        // 如果没有本地数据，初始化为空
        this.videoTasks = {};
        return false;
    },
    
    // 保存任务数据到本地存储
    saveTasksToStorage: function() {
        try {
            const tasksData = {
                videoTasks: this.videoTasks,
                lastUpdated: new Date().toISOString()
            };
            Utils.saveToStorage(AppConfig.STORAGE_KEYS.TASKS_CACHE, tasksData);
            return true;
        } catch (error) {
            console.error('保存任务数据失败:', error);
            return false;
        }
    },
    
    // 设置当前视频并加载任务
    setCurrentVideo: async function(video) {
        console.log('设置当前视频:', video);
        this.currentVideo = video;
        
        try {
            // 先尝试从API加载任务状态
            const apiTasks = await this.loadTasksFromAPI();
            
            if (apiTasks && apiTasks.length > 0) {
                // 使用API返回的任务状态
                this.currentTasks = apiTasks;
                console.log('从API加载任务成功:', this.currentTasks);
            } else {
                // 初始化新任务（默认状态为未完成）
                this.currentTasks = [
                    { 
                        id: 1, 
                        title: "看视频任务", 
                        type: "watch", 
                        description: "观看完整教学视频", 
                        status: "incomplete", 
                        externalLink: "https://app.mediatrack.cn/projects/2009960971614818304/files",
                        platformName: "分秒帧平台"
                    },
                    { 
                        id: 2, 
                        title: "研视频任务", 
                        type: "research", 
                        description: "完成教学反思与研讨笔记", 
                        status: "incomplete", 
                        externalLink: "https://shimo.im/space/2wAldmGZonhwbwAP",
                        platformName: "石墨文档协同空间"
                    }
                ];
                console.log('初始化新任务:', this.currentTasks);
            }
            
        } catch (error) {
            console.error('加载任务失败，使用默认任务:', error);
            // 如果API调用失败，使用默认任务
            this.currentTasks = [
                { 
                    id: 1, 
                    title: "看视频任务", 
                    type: "watch", 
                    description: "观看完整教学视频", 
                    status: "incomplete", 
                    externalLink: "https://app.mediatrack.cn/projects/2009960971614818304/files",
                    platformName: "分秒帧平台"
                },
                { 
                    id: 2, 
                    title: "研视频任务", 
                    type: "research", 
                    description: "完成教学反思与研讨笔记", 
                    status: "incomplete", 
                    externalLink: "https://shimo.im/space/2wAldmGZonhwbwAP",
                    platformName: "石墨文档协同空间"
                }
            ];
        }
        
        return this.currentTasks;
    },
    
    // 从API加载任务状态
    loadTasksFromAPI: async function() {
        try {
            console.log('从API加载任务状态...');
            
            // 调用API获取任务列表
            const clubId = Number(
                (window.App && App.state && App.state.currentClubId) ||
                (window.Clubs && Clubs.getCurrentClub && Clubs.getCurrentClub()?.id)
            );
            if (!Number.isInteger(clubId)) {
                console.error('Missing valid clubId for tasks API.');
                return null;
            }
            const result = await API.getTasks({ clubId });
            
            if (result && result.code === 0 && result.data) {
                console.log('API返回任务数据:', result.data);
                
                // 根据API返回的数据创建任务列表
                // 这里假设API返回的任务列表格式与我们的任务格式匹配
                let tasks = [];
                
                // 创建基础任务模板
                const taskTemplates = [
                    { 
                        id: 1, 
                        title: "看视频任务", 
                        type: "watch", 
                        description: "观看完整教学视频", 
                        status: "incomplete", 
                        externalLink: "https://app.mediatrack.cn/projects/2009960971614818304/files",
                        platformName: "分秒帧平台"
                    },
                    { 
                        id: 2, 
                        title: "研视频任务", 
                        type: "research", 
                        description: "完成教学反思与研讨笔记", 
                        status: "incomplete", 
                        externalLink: "https://shimo.im/space/2wAldmGZonhwbwAP",
                        platformName: "石墨文档协同空间"
                    }
                ];
                
                // 如果API返回的是任务数组，尝试匹配状态
                if (Array.isArray(result.data)) {
                    result.data.forEach(apiTask => {
                        const template = taskTemplates.find(t => t.id === apiTask.id || t.type === apiTask.type);
                        if (template) {
                            // 使用API返回的状态
                            tasks.push({
                                ...template,
                                status: apiTask.status || "incomplete",
                                taskId: apiTask.taskId || apiTask.id,
                                // 保存API返回的完整数据用于后续提交
                                apiData: apiTask
                            });
                        }
                    });
                }
                
                // 如果tasks为空，使用模板
                if (tasks.length === 0) {
                    tasks = taskTemplates;
                }
                
                console.log('处理后的任务列表:', tasks);
                return tasks;
            }
        } catch (error) {
            console.error('从API加载任务失败:', error);
        }
        
        return null;
    },
    
    // 获取指定任务的状态
    getTaskStatus: async function(taskId) {
        try {
            // 尝试从API获取最新状态
            const clubId = Number(
                (window.App && App.state && App.state.currentClubId) ||
                (window.Clubs && Clubs.getCurrentClub && Clubs.getCurrentClub()?.id)
            );
            if (!Number.isInteger(clubId)) {
                console.error('Missing valid clubId for tasks API.');
                return "incomplete";
            }
            const result = await API.getTasks({ clubId });
            
            if (result && result.code === 0 && result.data) {
                if (Array.isArray(result.data)) {
                    const task = result.data.find(t => 
                        t.id === taskId || 
                        t.taskId === taskId || 
                        (taskId === 1 && t.type === 'watch') ||
                        (taskId === 2 && t.type === 'research')
                    );
                    
                    if (task) {
                        return task.status || "incomplete";
                    }
                }
            }
        } catch (error) {
            console.error('获取任务状态失败:', error);
        }
        
        // 从本地任务中查找状态
        const localTask = this.currentTasks.find(t => t.id === taskId);
        return localTask ? localTask.status : "incomplete";
    },
    
    // 更新任务状态并保存到API
    updateTaskStatus: async function(taskId, status, completionData = {}) {
        console.log('更新任务状态:', { taskId, status, completionData });
        
        try {
            // 1. 更新本地任务状态
            const taskIndex = this.currentTasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                this.currentTasks[taskIndex].status = status;
                
                // 保存到本地存储
                if (this.currentVideo && this.currentVideo.id) {
                    if (!this.videoTasks[this.currentVideo.id]) {
                        this.videoTasks[this.currentVideo.id] = {};
                    }
                    this.videoTasks[this.currentVideo.id][taskId] = {
                        status: status,
                        completedAt: new Date().toISOString(),
                        ...completionData
                    };
                    this.saveTasksToStorage();
                }
            }
            
            // 2. 调用API提交任务完成状态
            // 根据API文档，任务完成接口是 POST /tasks/:id/complete
            const result = await API.completeTask(taskId, completionData);
            
            if (result && result.code === 0) {
                console.log('任务状态已成功保存到API');
                return {
                    success: true,
                    message: '任务状态已更新'
                };
            } else {
                console.error('API返回错误:', result);
                return {
                    success: false,
                    message: result?.msg || '保存到API失败'
                };
            }
            
        } catch (error) {
            console.error('更新任务状态失败:', error);
            return {
                success: false,
                message: error.message || '更新任务状态失败'
            };
        }
    },
    
    // 检查所有任务是否完成
    areAllTasksCompleted: function() {
        if (!this.currentTasks || this.currentTasks.length === 0) {
            return false;
        }
        
        return this.currentTasks.every(task => task.status === 'complete');
    },
    
    // 获取任务完成进度
    getTaskProgress: function() {
        if (!this.currentTasks || this.currentTasks.length === 0) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        
        const completed = this.currentTasks.filter(task => task.status === 'complete').length;
        const total = this.currentTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { completed, total, percentage };
    },
    
    // 打开外部平台
    openExternalPlatform: function(taskId) {
        console.log('打开外部平台，任务ID:', taskId);
        
        const task = this.currentTasks.find(t => t.id === taskId);
        if (!task) {
            console.error('任务未找到:', taskId);
            return false;
        }
        
        console.log('任务信息:', task);
        
        if (task.externalLink) {
            console.log('打开外部链接:', task.externalLink);
            window.open(task.externalLink, '_blank');
            return true;
        }
        
        console.error('任务没有外部链接');
        return false;
    },
    
    // 渲染任务列表
    renderTaskList: function() {
            console.log('渲染任务列表，当前任务数量:', this.currentTasks.length);
    
    const container = document.getElementById('taskList');
    if (!container) {
        console.error('任务列表容器未找到，等待DOM加载');
        // 延迟重试
        setTimeout(() => {
            this.renderTaskList();
        }, 100);
        return;
    }
        
        container.innerHTML = '';
        
        if (!this.currentTasks || this.currentTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-tasks"></i>
                    <h3>暂无任务</h3>
                    <p>该视频还没有任务</p>
                    <button class="btn btn-outline" onclick="window.App.goBackToVideos()" style="margin-top: 20px;">
                        <i class="fas fa-arrow-left"></i> 返回视频列表
                    </button>
                </div>
            `;
            return;
        }
        
        this.currentTasks.forEach(task => {
            const statusClass = task.status === 'complete' ? 'task-status-complete' : 'task-status-incomplete';
            const statusText = task.status === 'complete' ? '已完成 <i class="fas fa-check"></i>' : '未完成';
            
            let actionButtons = '';
            if (task.status === 'complete') {
                actionButtons = `<button class="btn btn-outline" disabled><i class="fas fa-check-circle"></i> 已完成</button>`;
            } else {
                const platformIcon = task.type === 'watch' ? 'fas fa-video' : 'fas fa-file-alt';
                const platformName = task.type === 'watch' ? '分秒帧平台' : '石墨文档协同空间';
                const tooltipText = task.type === 'watch' 
                    ? '请在分秒帧平台完成视频观看后点击' 
                    : '请在石墨文档协同空间完成教研笔记后点击';
                
                actionButtons = `
                    <div class="action-buttons">
                        <button class="btn btn-primary" onclick="Tasks.openExternalPlatform(${task.id})">
                            <i class="${platformIcon}"></i> 前往${platformName}
                        </button>
                        <button class="btn btn-success mark-complete-btn" 
                                onclick="App.markTaskComplete(${task.id})"
                                data-task-id="${task.id}"
                                data-task-type="${task.type}"
                                data-platform-name="${platformName}"
                                data-tooltip="${tooltipText}">
                            <i class="fas fa-check-circle"></i> 标记完成
                        </button>
                    </div>
                `;
            }
            
            const platformInfo = task.type === 'watch' 
                ? '<div style="font-size:14px; color:#666; margin-top:8px; display: flex; align-items: center; gap: 6px;"><i class="fas fa-external-link-alt"></i> 将在分秒帧平台观看视频</div>'
                : '<div style="font-size:14px; color:#666; margin-top:8px; display: flex; align-items: center; gap: 6px;"><i class="fas fa-file-alt"></i> 将在石墨文档协同空间完成笔记</div>';
            
            container.innerHTML += `
                <div class="task-card-item" data-task-id="${task.id}">
                    <div class="task-card-header">
                        <div class="task-card-title">${task.title}</div>
                        <div class="task-card-status ${statusClass}">${statusText}</div>
                    </div>
                    <div class="task-card-description">
                        ${task.description}
                        ${platformInfo}
                    </div>
                    <div class="task-card-actions">
                        ${actionButtons}
                    </div>
                </div>
            `;
        });
        
        // 为所有标记完成按钮添加工具提示功能
        this.setupTooltips();
    },
    
    // 设置工具提示
    setupTooltips: function() {
        // 延迟执行，确保DOM已更新
        setTimeout(() => {
            const markCompleteBtns = document.querySelectorAll('.mark-complete-btn');
            
            markCompleteBtns.forEach(btn => {
                const tooltipText = btn.getAttribute('data-tooltip');
                const taskId = btn.getAttribute('data-task-id');
                
                // 创建工具提示元素
                const tooltip = document.createElement('div');
                tooltip.className = 'task-tooltip';
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: 120%;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #333;
                    color: white;
                    padding: 10px 14px;
                    border-radius: 8px;
                    font-size: 13px;
                    white-space: nowrap;
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s, visibility 0.3s;
                    pointer-events: none;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    max-width: 280px;
                    text-align: center;
                    line-height: 1.5;
                `;
                tooltip.innerHTML = `
                    ${tooltipText}
                    <div style="
                        content: '';
                        position: absolute;
                        top: 100%;
                        left: 50%;
                        transform: translateX(-50%);
                        border-width: 6px;
                        border-style: solid;
                        border-color: #333 transparent transparent transparent;
                    "></div>
                `;
                
                // 将工具提示添加到按钮父元素
                const buttonContainer = btn.parentElement;
                if (buttonContainer) {
                    buttonContainer.style.position = 'relative';
                    buttonContainer.appendChild(tooltip);
                }
                
                // 添加鼠标事件
                btn.addEventListener('mouseenter', function() {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                });
                
                btn.addEventListener('mouseleave', function() {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                });
                
                // 点击按钮时也隐藏提示
                btn.addEventListener('click', function() {
                    setTimeout(() => {
                        tooltip.style.opacity = '0';
                        tooltip.style.visibility = 'hidden';
                    }, 300);
                });
            });
            
            console.log('工具提示设置完成，找到', markCompleteBtns.length, '个按钮');
        }, 100);
    }
};
