// AI聊天模块
window.AIChat = {
    // 当前会话ID
    conversationId: null,
    
    // 当前任务和俱乐部ID
    currentTaskId: null,
    currentClubId: null,
    
    // 聊天历史
    chatHistory: [],
    
    // 是否正在接收消息
    isReceiving: false,
    
    /**
     * 初始化AI聊天模块
     */
    init: function() {
        console.log('[AI Chat] 初始化AI聊天模块');
        
        // 从本地存储恢复conversationId
        this.conversationId = Utils.getConversationId();
        
        // 恢复聊天历史
        this.chatHistory = Utils.getAIChatHistory();
        
        console.log('[AI Chat] 初始化完成，conversationId:', this.conversationId);
    },
    
    /**
     * 设置当前任务和俱乐部上下文
     */
    setContext: function(taskId, clubId) {
        this.currentTaskId = taskId;
        this.currentClubId = clubId;
        console.log('[AI Chat] 设置上下文 - taskId:', taskId, 'clubId:', clubId);
    },
    
    /**
     * 发送消息到AI
     * @param {string} message - 用户消息
     * @param {function} onChunk - 接收消息片段的回调函数
     * @param {function} onComplete - 完成时的回调函数
     * @param {function} onError - 错误时的回调函数
     */
    async sendMessage(message, onChunk, onComplete, onError) {
        if (!message || !message.trim()) {
            console.warn('[AI Chat] 消息为空');
            return;
        }
        
        if (this.isReceiving) {
            console.warn('[AI Chat] 正在接收消息，请等待...');
            return;
        }
        
        this.isReceiving = true;
        
        // 保存用户消息到历史
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };
        this.chatHistory.push(userMessage);
        this.saveChatHistory();
        
        try {
            console.log('[AI Chat] 发送消息:', message);
            console.log('[AI Chat] conversationId:', this.conversationId);
            console.log('[AI Chat] taskId:', this.currentTaskId);
            console.log('[AI Chat] clubId:', this.currentClubId);
            
            // 调用API发送消息
            await window.API.sendAIMessage(
                message,
                this.conversationId,
                this.currentTaskId,
                this.currentClubId,
                (chunk) => {
                    // 接收到消息片段
                    if (onChunk) onChunk(chunk);
                },
                (newConversationId) => {
                    // 消息接收完成
                    this.isReceiving = false;
                    
                    // 更新conversationId
                    if (newConversationId && newConversationId !== this.conversationId) {
                        this.conversationId = newConversationId;
                        Utils.saveConversationId(newConversationId);
                        console.log('[AI Chat] 更新conversationId:', newConversationId);
                    }
                    
                    if (onComplete) onComplete(newConversationId);
                }
            );
            
        } catch (error) {
            console.error('[AI Chat] 发送消息失败:', error);
            this.isReceiving = false;
            if (onError) onError(error);
        }
    },
    
    /**
     * 保存AI助手消息到历史
     */
    saveAssistantMessage: function(content) {
        const assistantMessage = {
            role: 'assistant',
            content: content,
            timestamp: new Date().toISOString()
        };
        this.chatHistory.push(assistantMessage);
        this.saveChatHistory();
    },
    
    /**
     * 保存聊天历史到本地存储
     */
    saveChatHistory: function() {
        // 只保留最近50条消息
        const maxHistory = window.AppConfig.AI_CONFIG.MAX_HISTORY_LENGTH || 50;
        if (this.chatHistory.length > maxHistory) {
            this.chatHistory = this.chatHistory.slice(-maxHistory);
        }
        
        Utils.saveAIChatHistory(this.chatHistory);
    },
    
    /**
     * 获取聊天历史
     */
    getChatHistory: function() {
        return this.chatHistory;
    },
    
    /**
     * 清空聊天历史
     */
    clearChatHistory: function() {
        if (confirm('确定要清空所有聊天记录吗？')) {
            this.chatHistory = [];
            this.conversationId = null;
            this.saveChatHistory();
            Utils.saveConversationId(null);
            console.log('[AI Chat] 聊天历史已清空');
            return true;
        }
        return false;
    },
    
    /**
     * 导出聊天历史
     */
    exportChatHistory: function() {
        if (this.chatHistory.length === 0) {
            alert('没有聊天记录可导出');
            return;
        }
        
        const exportData = {
            conversationId: this.conversationId,
            taskId: this.currentTaskId,
            clubId: this.currentClubId,
            history: this.chatHistory,
            exportTime: new Date().toISOString()
        };
        
        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-chat-history-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('[AI Chat] 聊天历史已导出');
    }
};