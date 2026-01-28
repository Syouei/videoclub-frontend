// 站内信通知模块
window.Notifications = {
    // 通知数据
    notifications: [],
    unreadCount: 0,
    
    // 初始化
    init: function() {
        console.log('通知模块初始化');
        this.loadFromStorage();
        return this;
    },
    
    // 从本地存储加载
    loadFromStorage: function() {
        try {
            const data = Utils.getFromStorage(AppConfig.STORAGE_KEYS.NOTIFICATIONS);
            if (data) {
                this.notifications = data.notifications || [];
                this.unreadCount = data.unreadCount || 0;
                console.log('从本地存储加载通知数据');
            }
        } catch (error) {
            console.error('加载通知数据失败:', error);
        }
    },
    
    // 保存到本地存储
    saveToStorage: function() {
        try {
            const data = {
                notifications: this.notifications,
                unreadCount: this.unreadCount,
                lastUpdated: new Date().toISOString()
            };
            Utils.saveToStorage(AppConfig.STORAGE_KEYS.NOTIFICATIONS, data);
        } catch (error) {
            console.error('保存通知数据失败:', error);
        }
    },
    
    // 获取通知列表
    getNotifications: async function(params = {}) {
        try {
            console.log('获取通知列表，参数:', params);
            
            // 调用API获取通知列表
            const response = await API.getNotifications(params);
            
            if (response && response.code === 0) {
                const apiNotifications = response.data.list || [];
                
                // 转换数据格式
                this.notifications = apiNotifications.map(notif => this.transformNotificationData(notif));
                this.unreadCount = this.notifications.filter(n => !n.isRead).length;
                this.saveToStorage();
                
                console.log('获取通知列表成功:', this.notifications.length, '条');
                return this.notifications;
            } else {
                console.warn('获取通知列表API返回错误:', response);
                return this.notifications;
            }
        } catch (error) {
            console.error('获取通知列表失败:', error);
            return this.notifications;
        }
    },
    
    // 获取未读数量
    getUnreadCount: async function() {
        try {
            console.log('获取未读通知数量');
            
            // 调用API获取未读数量
            const response = await API.getUnreadCount();
            
            if (response && response.code === 0) {
                this.unreadCount = response.data.total || 0;
                this.saveToStorage();
                
                console.log('未读通知数量:', this.unreadCount);
                return this.unreadCount;
            } else {
                console.warn('获取未读数量API返回错误:', response);
                return this.unreadCount;
            }
        } catch (error) {
            console.error('获取未读数量失败:', error);
            return this.unreadCount;
        }
    },
    
    // 数据结构转换
    transformNotificationData: function(apiData) {
        return {
            id: apiData.notificationId,
            userId: apiData.userId,
            type: apiData.type,
            title: apiData.title,
            content: apiData.content,
            payload: apiData.payload || {},
            isRead: apiData.isRead || false,
            readAt: apiData.readAt,
            createdAt: apiData.createdAt,
            // 添加处理状态字段
            processed: apiData.isProcessed ?? apiData.processed ?? false,
            processedResult: apiData.processedResult || null // 'approved' 或 'rejected'
        };
    },
    
    // 标记为已读
    markAsRead: async function(notificationId) {
        // 埋点：标记通知为已读
        if (window.Analytics) {
            window.Analytics.trackButtonClick('mark_notification_read', { module: 'notification', target_object: `notification-${notificationId}` });
        }

        try {
            console.log('标记通知为已读，ID:', notificationId);
            
            // 调用API标记为已读
            const response = await API.markNotificationAsRead(notificationId);
            
            if (response && response.code === 0) {
                // 更新本地数据
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.isRead = true;
                    notification.readAt = new Date().toISOString();
                    
                    // 更新未读计数
                    if (!notification.isRead) {
                        this.unreadCount = Math.max(0, this.unreadCount - 1);
                    }
                    
                    this.saveToStorage();
                }
                
                console.log('标记为已读成功');
                return true;
            } else {
                console.warn('标记为已读API返回错误:', response);
                return false;
            }
        } catch (error) {
            console.error('标记为已读失败:', error);
            return false;
        }
    },
    
    // 标记通知为已处理
    markAsProcessed: function(notificationId, result) {
        try {
            console.log('标记通知为已处理，ID:', notificationId, '结果:', result);
            
            // 更新本地数据
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.processed = true;
                notification.processedResult = result;
                this.saveToStorage();
                console.log('标记为已处理成功');
                return true;
            }
            return false;
        } catch (error) {
            console.error('标记为已处理失败:', error);
            return false;
        }
    },
    
    // 全部标记为已读
    markAllAsRead: async function() {
        // 埋点：全部标记为已读
        if (window.Analytics) {
            window.Analytics.trackButtonClick('mark_all_notifications_read', { module: 'notification', target_object: 'all-notifications' });
        }

        try {
            console.log('全部标记为已读');
            
            // 调用API全部标记为已读
            const response = await API.markAllNotificationsAsRead();
            
            if (response && response.code === 0) {
                // 更新本地数据
                this.notifications.forEach(notification => {
                    if (!notification.isRead) {
                        notification.isRead = true;
                        notification.readAt = new Date().toISOString();
                    }
                });
                
                this.unreadCount = 0;
                this.saveToStorage();
                
                console.log('全部标记为已读成功');
                return true;
            } else {
                console.warn('全部标记为已读API返回错误:', response);
                return false;
            }
        } catch (error) {
            console.error('全部标记为已读失败:', error);
            return false;
        }
    },
    
    // 渲染通知列表 - 修改后版本：统一显示所有通知
    renderNotificationList: function() {
        const container = document.getElementById('notification-list');
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        if (!this.notifications || this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell"></i>
                    <h3>暂无通知</h3>
                    <p>您还没有收到任何通知</p>
                </div>
            `;
            return;
        }
        
        // 按创建时间倒序排序（最新的在前面）
        const sortedNotifications = [...this.notifications].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // 渲染所有通知，统一风格
        sortedNotifications.forEach(notification => {
            this.renderSingleNotification(notification, container);
        });
    },
    
    // 渲染单个通知 - 统一风格
    renderSingleNotification: function(notification, container) {
        const payload = notification.payload || {};
        const isReadClass = notification.isRead ? 'read' : 'unread';
        const readIcon = notification.isRead ? 'fa-check-circle' : 'fa-circle';
        const readIconColor = notification.isRead ? '#52c41a' : '#1890ff';
        
        // 根据通知类型设置不同的样式
        let icon = 'fa-bell';
        let iconColor = '#999';
        let tagColor = '#1890ff';
        let tagText = '通知';
        
        switch(notification.type) {
            case 'club_join_request':
                icon = 'fa-user-plus';
                iconColor = '#1890ff';
                tagColor = '#1890ff';
                tagText = '入会申请';
                break;
            case 'task_assigned':
                icon = 'fa-tasks';
                iconColor = '#52c41a';
                tagColor = '#52c41a';
                tagText = '任务';
                break;
            case 'club_announcement':
                icon = 'fa-bullhorn';
                iconColor = '#faad14';
                tagColor = '#faad14';
                tagText = '公告';
                break;
            case 'system':
                icon = 'fa-cog';
                iconColor = '#722ed1';
                tagColor = '#722ed1';
                tagText = '系统';
                break;
        }
        
        // 如果是入会申请类型，显示审批按钮
        let actionButtons = '';
        // 检查通知是否已被处理
        const isProcessed = notification.processed || false;
        const processedResult = notification.processedResult || '';
        
        if (notification.type === 'club_join_request' && payload.requestId && payload.clubId && !isProcessed) {
            actionButtons = `
                <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                    <button class="btn btn-primary btn-sm" onclick="handleApproveRequest(${payload.requestId}, ${payload.clubId}, '${notification.id}')" style="padding: 2px 8px; font-size: 10px; min-height: 32px;">
                        <i class="fas fa-check" style="font-size: 12px;"></i> 批准
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="handleRejectRequest(${payload.requestId}, ${payload.clubId}, '${notification.id}')" style="padding: 2px 8px; font-size: 10px; min-height: 32px;">
                        <i class="fas fa-times" style="font-size: 12px;"></i> 驳回
                    </button>
                </div>
            `;
        } else if (notification.type === 'club_join_request' && isProcessed) {
            // 如果已经处理过，显示处理结果
            let resultText = '';
            let resultColor = '';
            let resultIcon = '';
            
            if (processedResult === 'approved') {
                resultText = '已批准';
                resultColor = '#52c41a';
                resultIcon = 'fa-check-circle';
            } else if (processedResult === 'rejected') {
                resultText = '已驳回';
                resultColor = '#ff4d4f';
                resultIcon = 'fa-times-circle';
            }
            
            if (resultText) {
                actionButtons = `
                    <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: flex-end;">
                        <span style="padding: 6px 16px; font-size: 13px; color: ${resultColor}; border: 1px solid ${resultColor}; border-radius: 4px; display: flex; align-items: center; gap: 5px;">
                            <i class="fas ${resultIcon}" style="font-size: 12px;"></i> ${resultText}
                        </span>
                    </div>
                `;
            }
        }
        
        // 入会申请特有的信息
        let applyMessage = '';
        if (notification.type === 'club_join_request' && payload.applyMessage) {
            applyMessage = `
                <div style="font-size: 13px; color: #333; margin: 8px 0; padding: 10px; background: white; border-radius: 4px; border-left: 3px solid #1890ff; border: 1px solid #e8e8e8;">
                    <strong>申请说明：</strong>${payload.applyMessage}
                </div>
            `;
        }
        
        // 获取申请人用户名（如果是入会申请）
        let applicantInfo = '';
        if (notification.type === 'club_join_request' && payload.applicantId) {
            this.getApplicantName(payload.applicantId).then(applicantName => {
                const notificationElement = container.querySelector(`[data-notification-id="${notification.id}"]`);
                if (notificationElement) {
                    const applicantSpan = notificationElement.querySelector('.applicant-info');
                    if (applicantSpan) {
                        applicantSpan.textContent = `申请者：${applicantName}`;
                    }
                }
            });
            applicantInfo = `<span class="applicant-info"><i class="fas fa-user"></i> 申请者：加载中...</span>`;
        }
        
        const html = `
            <div class="notification-card ${isReadClass}" data-notification-id="${notification.id}" style="margin-left: 80px; margin-right: auto; max-width: 600px; width: calc(100% - 160px); margin-bottom: 25px;">
                <div style="display: flex; align-items: flex-start;">
                    <div style="margin-right: 12px; color: ${iconColor};">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                    <h4 style="margin: 0; font-size: 15px; color: #333;">${notification.title}</h4>
                                    <span style="background: ${tagColor}; color: white; font-size: 11px; padding: 2px 8px; border-radius: 10px;">${tagText}</span>
                                </div>
                                <div style="font-size: 12px; color: #999;">
                                    <i class="far fa-clock"></i> ${new Date(notification.createdAt).toLocaleString('zh-CN')}
                                </div>
                            </div>
                            <div style="color: ${readIconColor}; margin-left: 10px;">
                                <i class="fas ${readIcon}"></i>
                            </div>
                        </div>
                        
                        
                        ${applyMessage}
                        
                        <div style="font-size: 13px; color: #666; display: flex; gap: 20px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0;">
                            ${notification.type === 'club_join_request' && payload.clubName ? 
                                `<span><i class="fas fa-users"></i> 俱乐部：${payload.clubName}</span>` : ''}
                            ${applicantInfo}
                            ${notification.type === 'task_assigned' && payload.taskTitle ? 
                                `<span><i class="fas fa-tasks"></i> 任务：${payload.taskTitle}</span>` : ''}
                        </div>
                        
                        ${actionButtons}
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
    },
    
    // 获取申请人用户名
    getApplicantName: async function(userId) {
        try {
            if (!userId) return '未知用户';
            
            // 先尝试从缓存获取
            if (window.Clubs && window.Clubs.userNameCache && window.Clubs.userNameCache[userId]) {
                return window.Clubs.userNameCache[userId];
            }
            
            // 调用API获取用户信息
            const response = await API.getUserDetail(userId);
            if (response && response.code === 0 && response.data) {
                const username = response.data.username || `用户${userId}`;
                
                // 缓存用户名
                if (window.Clubs && window.Clubs.userNameCache) {
                    window.Clubs.userNameCache[userId] = username;
                }
                
                return username;
            }
        } catch (error) {
            console.error('获取申请人用户名失败:', error);
        }
        
        return `用户${userId}`;
    }
};
