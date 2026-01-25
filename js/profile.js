// 个人资料管理模块
window.Profile = {
    // 用户个人资料数据
    currentProfile: null,
    
    // 初始化
    init: function() {
        this.loadProfileFromStorage();
        return this;
    },
    
    // 从本地存储加载个人资料
    loadProfileFromStorage: function() {
        try {
            // 先从本地存储加载
            const profileData = Utils.getFromStorage('user_profile');
            
            if (profileData) {
                this.currentProfile = profileData;
                console.log('[Profile] 从本地存储加载个人资料', profileData);
                return true;
            }
        } catch (error) {
            console.error('[Profile] 加载个人资料失败:', error);
        }
        
        // 如果本地存储没有，尝试从用户信息中获取
        if (window.Auth && window.Auth.currentUser && window.Auth.currentUser.profile) {
            this.currentProfile = window.Auth.currentUser.profile;
            console.log('[Profile] 从用户信息加载个人资料');
            return true;
        }
        
        // 都没有，创建空对象
        this.currentProfile = {};
        console.log('[Profile] 创建空的个人资料对象');
        return false;
    },
    
    // 获取个人资料
    getUserProfile: function() {
        return this.currentProfile;
    },
    
    // 保存个人资料
    saveUserProfile: async function(profileData) {
        try {
            console.log('[Profile] 尝试保存个人资料:', profileData);
            
            // 验证必填字段 - 使用API文档中的字段名
            const validationResult = this.validateProfile(profileData);
            if (!validationResult.isValid) {
                console.error('[Profile] 验证失败:', validationResult.message);
                throw new Error(validationResult.message || '个人资料验证失败');
            }
            
            // 合并数据
            this.currentProfile = {
                ...this.currentProfile,
                ...profileData,
                updatedAt: new Date().toISOString()
            };
            
            // 保存到本地存储
            const saveResult = Utils.saveToStorage('user_profile', this.currentProfile);
            if (!saveResult) {
                throw new Error('保存到本地存储失败');
            }
            
            // 同时保存到用户信息中
            if (window.Auth && window.Auth.currentUser) {
                window.Auth.currentUser.profile = this.currentProfile;
                // 更新用户信息显示
                window.Auth.updateUserDisplay();
            }
            
            console.log('[Profile] 个人资料保存成功:', this.currentProfile);
            
            return {
                success: true,
                message: '个人资料保存成功',
                profile: this.currentProfile
            };
            
        } catch (error) {
            console.error('[Profile] 保存个人资料失败:', error);
            return {
                success: false,
                message: error.message || '保存个人资料失败'
            };
        }
    },
    
    // 验证个人资料 - 按照API文档的字段名
    validateProfile: function(profileData) {
        console.log('[Profile] 验证数据:', profileData);
        
        // 只有在保存时才验证，加载时不验证
        if (!profileData || Object.keys(profileData).length === 0) {
            return {
                isValid: false,
                message: '没有需要验证的数据'
            };
        }
        
        const requiredFields = ['realname', 'age', 'school', 'phone', 'email'];
        
        const missingFields = [];
        
        // 检查必填字段
        requiredFields.forEach(field => {
            if (profileData[field] === undefined || profileData[field] === null || profileData[field].toString().trim() === '') {
                missingFields.push(this.getFieldLabel(field));
            }
        });
        
        // 特殊验证
        const errors = [];
        
        // 验证年龄
        if (profileData.age !== undefined && profileData.age !== null) {
            const age = parseInt(profileData.age);
            if (isNaN(age) || age < 1 || age > 100) {
                errors.push('年龄必须在1-100岁之间');
            }
        }
        
        // 验证手机号
        if (profileData.phone !== undefined && profileData.phone !== null) {
            const phoneStr = profileData.phone.toString();
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(phoneStr)) {
                errors.push('手机号格式不正确');
            }
        }
        
        // 验证邮箱
        if (profileData.email !== undefined && profileData.email !== null) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profileData.email)) {
                errors.push('邮箱格式不正确');
            }
        }
        
        if (missingFields.length > 0) {
            errors.push(`请填写以下必填字段：${missingFields.join('、')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            message: errors.join('；')
        };
    },
    
    // 获取字段标签
    getFieldLabel: function(fieldName) {
        const fieldLabels = {
            'realname': '真实姓名',
            'gender': '性别',
            'age': '年龄',
            'school': '学校',
            'phone': '手机号',
            'email': '邮箱',
            'studentId': '学号',
            'job': '角色'
        };
        
        return fieldLabels[fieldName] || fieldName;
    },
    
    // 计算个人资料完成度
    calculateCompletion: function() {
        if (!this.currentProfile) {
            return 0;
        }
        
        const requiredFields = ['realname', 'age', 'school', 'phone', 'email'];
        
        let completedCount = 0;
        
        requiredFields.forEach(field => {
            if (this.currentProfile[field] !== undefined && 
                this.currentProfile[field] !== null && 
                this.currentProfile[field].toString().trim() !== '') {
                
                // 特殊验证
                if (field === 'age') {
                    const age = parseInt(this.currentProfile[field]);
                    if (age >= 1 && age <= 100) {
                        completedCount++;
                    }
                } else if (field === 'phone') {
                    const phoneStr = this.currentProfile[field].toString();
                    const phoneRegex = /^1[3-9]\d{9}$/;
                    if (phoneRegex.test(phoneStr)) {
                        completedCount++;
                    }
                } else if (field === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(this.currentProfile[email])) {
                        completedCount++;
                    }
                } else {
                    completedCount++;
                }
            }
        });
        
        const percentage = requiredFields.length > 0 ? Math.round((completedCount / requiredFields.length) * 100) : 0;
        return percentage;
    },
    
    // 获取完成度等级
    getCompletionLevel: function() {
        const percentage = this.calculateCompletion();
        const thresholds = AppConfig.USER_PROFILE_COMPLETION?.thresholds || {
            basic: 60,
            medium: 80,
            complete: 95
        };
        
        if (percentage >= thresholds.complete) {
            return 'complete';
        } else if (percentage >= thresholds.medium) {
            return 'medium';
        } else if (percentage >= thresholds.basic) {
            return 'basic';
        } else {
            return 'low';
        }
    },
    
    // 获取完成度描述
    getCompletionDescription: function() {
        const level = this.getCompletionLevel();
        const percentage = this.calculateCompletion();
        
        const descriptions = {
            'low': `资料完成度较低（${percentage}%），请完善基本信息`,
            'basic': `资料基本完整（${percentage}%），建议补充更多信息`,
            'medium': `资料较为完整（${percentage}%）`,
            'complete': `资料非常完整（${percentage}%）`
        };
        
        return descriptions[level] || `资料完成度：${percentage}%`;
    },
    
    // 检查是否需要提醒完善资料
    shouldShowReminder: function() {
        const percentage = this.calculateCompletion();
        const threshold = AppConfig.USER_PROFILE_COMPLETION?.thresholds?.basic || 60;
        return percentage < threshold;
    },
    
    // 获取个人资料摘要
    getProfileSummary: function() {
        if (!this.currentProfile) {
            return null;
        }
        
        const summary = {};
        const fieldLabels = this.getFieldLabels();
        
        Object.keys(this.currentProfile).forEach(key => {
            if (this.currentProfile[key] !== undefined && 
                this.currentProfile[key] !== null && 
                this.currentProfile[key].toString().trim() !== '') {
                summary[fieldLabels[key] || key] = this.currentProfile[key];
            }
        });
        
        return summary;
    },
    
    // 获取字段标签映射
    getFieldLabels: function() {
        return {
            'realname': '真实姓名',
            'gender': '性别',
            'age': '年龄',
            'school': '学校',
            'studentId': '学号',
            'phone': '手机号',
            'email': '邮箱',
            'job': '角色',
            'signature': '个性签名',
            'updatedAt': '最后更新时间'
        };
    },
    
    // 获取性别显示文本
    getGenderDisplay: function(genderValue) {
        const genderMap = {
            'male': '男',
            'female': '女',
            'other': '其他',
            'secret': '保密'
        };
        
        return genderMap[genderValue] || genderValue;
    },
    
    // 获取职业显示文本
    getJobDisplay: function(jobValue) {
        const jobMap = {
            'student': '学生',
            'teacher': '教师'
        };
        
        return jobMap[jobValue] || jobValue;
    },
    
    // 发送个人资料更新事件（埋点）
    sendProfileUpdateEvent: function() {
        if (!Utils.isPrivacyAgreed()) {
            return;
        }
        
        const completion = this.calculateCompletion();
        const level = this.getCompletionLevel();
        
        const eventData = {
            completionPercentage: completion,
            completionLevel: level,
            fieldCount: this.currentProfile ? Object.keys(this.currentProfile).length : 0
        };
        
        Utils.sendPrivacyEvent('profile_updated', eventData);
        
        console.log('[埋点] 个人资料更新:', eventData);
    },
    
    // 导出个人资料
    exportProfile: function() {
        try {
            if (!this.currentProfile) {
                throw new Error('没有个人资料可导出');
            }
            
            const exportData = {
                profile: this.currentProfile,
                exportDate: new Date().toISOString(),
                appVersion: '1.0',
                exportType: 'user_profile'
            };
            
            // 转换为JSON字符串
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // 创建下载链接
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `个人资料备份_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('[Profile] 个人资料导出成功');
            return true;
            
        } catch (error) {
            console.error('[Profile] 导出个人资料失败:', error);
            return false;
        }
    },
    
    // 清空个人资料
    clearProfile: function() {
        if (!confirm('确定要清空个人资料吗？此操作不可撤销。')) {
            return false;
        }
        
        try {
            this.currentProfile = {};
            Utils.removeFromStorage('user_profile');
            
            // 同时清除用户信息中的资料
            if (window.Auth && window.Auth.currentUser) {
                delete window.Auth.currentUser.profile;
            }
            
            console.log('[Profile] 个人资料已清空');
            return true;
            
        } catch (error) {
            console.error('[Profile] 清空个人资料失败:', error);
            return false;
        }
    }
};
