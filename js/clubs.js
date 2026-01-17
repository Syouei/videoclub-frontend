// 俱乐部管理模块 - 适配新的API格式
window.Clubs = {
    // 我的俱乐部列表
    myClubs: [],
    
    // 所有俱乐部数据库
    allClubs: [],
    
    // 当前选中的俱乐部
    currentClub: null,

    // 用户名缓存
    userNameCache: {},
    
    // 初始化俱乐部模块
    init: function() {
        this.loadClubsFromStorage();
        return this;
    },
    
    // 从本地存储加载俱乐部数据
    loadClubsFromStorage: function() {
        try {
            const clubsData = Utils.getFromStorage(AppConfig.STORAGE_KEYS.CLUBS_CACHE);
            if (clubsData && clubsData.myClubs) {
                this.myClubs = clubsData.myClubs;
                this.allClubs = clubsData.allClubs || [];
                console.log('从本地存储加载俱乐部数据');
                return true;
            }
        } catch (error) {
            console.error('加载俱乐部数据失败:', error);
        }
        
        // 如果没有本地数据，使用默认数据
        this.myClubs = [];
        this.allClubs = [
            { id: 101, name: "初中数学教研组", creator: "王老师", members: 12, tag: "数学", description: "初中数学教学研讨" },
            { id: 102, name: "PBL项目式学习", creator: "张老师", members: 8, tag: "综合", description: "项目式学习方法研讨" },
            { id: 103, name: "高中英语口语俱乐部", creator: "张老师", members: 8, tag: "英语", description: "英语口语教学研讨" },
            { id: 104, name: "物理实验教学组", creator: "李教授", members: 15, tag: "物理", description: "物理实验教学研讨" },
            { id: 105, name: "化学创新实验", creator: "王老师", members: 12, tag: "化学", description: "化学实验教学研讨" },
            { id: 106, name: "生物标本制作", creator: "赵老师", members: 6, tag: "生物", description: "生物标本制作研讨" }
        ];
        
        return false;
    },
    
    // 保存俱乐部数据到本地存储
    saveClubsToStorage: function() {
        try {
            const clubsData = {
                myClubs: this.myClubs,
                allClubs: this.allClubs,
                lastUpdated: new Date().toISOString()
            };
            Utils.saveToStorage(AppConfig.STORAGE_KEYS.CLUBS_CACHE, clubsData);
            return true;
        } catch (error) {
            console.error('保存俱乐部数据失败:', error);
            return false;
        }
    },
    
    // 加载我的俱乐部（从API）
    loadMyClubs: async function() {
        try {
            console.log('调用API获取我的俱乐部列表');
            // 从API获取数据 - 适配新的API格式
            const response = await API.getMyClubs();
            
            if (response && response.code === 0 && Array.isArray(response.data)) {
                // 转换API返回的数据格式
                this.myClubs = response.data.map(club => this.transformClubData(club));
                
                // 通过详情接口补全成员数量（我的俱乐部列表接口不返回memberCount）
                const detailList = await Promise.all(this.myClubs.map(async club => {
                    try {
                        const detail = await this.getClubDetail(club.id);
                        let creatorName = club.creator;
                        if (detail && detail.creatorId) {
                            creatorName = await this.getUserNameById(detail.creatorId);
                        }
                        if (detail) {
                            const updatedClub = { ...club, creator: creatorName };
                            if (typeof detail.memberCount === 'number') {
                                updatedClub.members = detail.memberCount;
                            }
                            return updatedClub;
                        }
                    } catch (error) {
                        console.warn('补全俱乐部成员数量失败:', club.id, error);
                    }
                    return club;
                }));
                this.myClubs = detailList;
                this.saveClubsToStorage();
                console.log('获取我的俱乐部成功:', this.myClubs);
                return this.myClubs;
            } else {
                console.warn('API返回格式不正确:', response);
                return this.myClubs;
            }
        } catch (error) {
            console.error('加载我的俱乐部失败:', error);
            // 如果API失败，使用本地数据
            console.log('使用本地俱乐部数据');
            return this.myClubs;
        }
    },
    
    // 搜索俱乐部
    searchClubs: async function(keyword) {
        try {
            console.log('搜索俱乐部，关键词:', keyword);
            // 从API搜索俱乐部 - 适配新的API格式
            const response = await API.getAllClubs({ keyword: keyword });
            
            if (response && response.code === 0 && response.data && Array.isArray(response.data.list)) {
                // 过滤掉已加入的俱乐部
                const joinedIds = this.myClubs.map(club => club.id);
                const clubs = response.data.list.map(club => ({
                    id: club.clubId,
                    name: club.name,
                    creatorId: club.creatorId,
                    creator: club.creatorId ? `${club.creatorId}` : '未知',
                    members: club.memberCount || 0,
                    tag: club.tag || '教研组',
                    description: club.description || ''
                }));

                const clubsWithCreator = await Promise.all(clubs.map(async club => {
                    if (club.creatorId) {
                        const creatorName = await this.getUserNameById(club.creatorId);
                        return { ...club, creator: creatorName };
                    }
                    return club;
                }));
                
                return clubsWithCreator.filter(club => !joinedIds.includes(club.id));
            } else {
                console.warn('搜索俱乐部API返回格式不正确:', response);
                return [];
            }
        } catch (error) {
            console.error('搜索俱乐部失败:', error);
            // 如果API失败，本地搜索
            const joinedIds = this.myClubs.map(club => club.id);
            return this.allClubs.filter(club => {
                if (joinedIds.includes(club.id)) return false;
                return club.name.includes(keyword) || 
                       club.tag.includes(keyword) || 
                       club.id.toString().includes(keyword);
            });
        }
    },
    
    // 创建俱乐部
    createClub: async function(clubData) {
        try {
            console.log('创建俱乐部，数据:', clubData);
            
            // 调用API创建俱乐部
            const response = await API.createClub({
                name: clubData.name,
                tag: clubData.tag || '教研组',
                description: clubData.description || ''
            });
            
            console.log('API创建俱乐部响应:', response);
            
            if (response && response.code === 0) {
                // 创建成功，获取俱乐部详情
                const clubDetail = await this.getClubDetail(response.data.clubId);
                
                if (clubDetail) {
                    // 转换数据结构
                    const newClub = this.transformClubData(clubDetail);
                    newClub.memberRole = 'manager'; // 创建者自动成为manager
                    newClub.joinTime = new Date().toISOString();
                    
                    // 添加到我的俱乐部列表
                    this.myClubs.push(newClub);
                    this.saveClubsToStorage();
                    
                    console.log('俱乐部创建成功:', newClub);
                    return { 
                        success: true, 
                        club: newClub,
                        message: `俱乐部"${clubData.name}"创建成功！`
                    };
                }
            }
            
            return { 
                success: false, 
                message: response ? response.msg : '创建俱乐部失败'
            };
            
        } catch (error) {
            console.error('创建俱乐部失败:', error);
            return { 
                success: false, 
                message: error.message || '创建俱乐部失败'
            };
        }
    },
    
    // 数据结构转换（API返回 → 前端显示）
    transformClubData: function(backendClub) {
        // 后端数据结构（API文档）
        // GET /clubs/:id 返回完整俱乐部信息
        // GET /users/me/clubs 返回 {clubId, clubName, memberRole, joinTime}
        
        const isDetail = backendClub.clubId === undefined; // 详情接口返回的格式
        
        return {
            id: backendClub.clubId || backendClub.id,
            name: backendClub.clubName || backendClub.name,
            role: backendClub.memberRole || 'member',
            creator: backendClub.creatorName || backendClub.creator || '未知',
            members: backendClub.memberCount || backendClub.members || 1,
            tag: backendClub.tag || '',
            description: backendClub.description || '',
            joinTime: backendClub.joinTime || new Date().toISOString()
        };
    },
    
    // 加入俱乐部
    joinClub: async function(clubId) {
        try {
            console.log('加入俱乐部，ID:', clubId);
            
            // 调用API加入俱乐部
            const response = await API.joinClub(clubId);
            
            console.log('加入俱乐部API响应:', response);
            
            if (response && response.code === 0) {
                // 获取俱乐部详情
                const clubDetail = await this.getClubDetail(clubId);
                
                if (clubDetail) {
                    const joinedClub = this.transformClubData(clubDetail);
                    joinedClub.memberRole = 'member';
                    joinedClub.joinTime = new Date().toISOString();
                    
                    // 添加到我的俱乐部列表
                    this.myClubs.push(joinedClub);
                    this.saveClubsToStorage();
                    
                    console.log('加入俱乐部成功:', joinedClub);
                    return { 
                        success: true, 
                        club: joinedClub,
                        message: `成功加入${joinedClub.name}！`
                    };
                }
            }
            
            return { 
                success: false, 
                message: response ? response.msg : '加入俱乐部失败'
            };
            
        } catch (error) {
            console.error('加入俱乐部失败:', error);
            return { 
                success: false, 
                message: error.message || '加入俱乐部失败'
            };
        }
    },
    
    // 获取俱乐部详情
    getClubDetail: async function(clubId) {
        try {
            console.log('获取俱乐部详情，ID:', clubId);
            
            // 调用API获取俱乐部详情
            const response = await API.getClubDetail(clubId);
            
            if (response && response.code === 0) {
                console.log('俱乐部详情:', response.data);
                return response.data;
            } else {
                console.warn('获取俱乐部详情失败:', response);
            }
        } catch (error) {
            console.error('获取俱乐部详情失败:', error);
        }
        
        // 如果API失败，从本地数据查找
        const club = this.myClubs.find(c => c.id === clubId) || 
                    this.allClubs.find(c => c.id === clubId);
        
        if (club) {
            return {
                id: club.id,
                name: club.name,
                creatorName: club.creator,
                memberCount: club.members,
                tag: club.tag,
                description: club.description
            };
        }
        
        return null;
    },

    // 获取用户名（缓存）
    getUserNameById: async function(userId) {
        if (!userId) return '未知';
        if (this.userNameCache[userId]) return this.userNameCache[userId];
        try {
            const response = await API.getUserDetail(userId);
            if (response && response.code === 0 && response.data && response.data.username) {
                this.userNameCache[userId] = response.data.username;
                return response.data.username;
            }
        } catch (error) {
            console.warn('获取用户详情失败:', userId, error);
        }
        const fallbackName = `ID:${userId}`;
        this.userNameCache[userId] = fallbackName;
        return fallbackName;
    },
    
    // 设置当前俱乐部
    setCurrentClub: function(clubId) {
        console.log('设置当前俱乐部，ID:', clubId);
        
        if (typeof clubId === 'object') {
            // 如果是对象，直接设置为当前俱乐部
            this.currentClub = clubId;
        } else {
            // 如果是ID，从我的俱乐部列表中查找
            this.currentClub = this.myClubs.find(c => c.id === clubId);
            
            // 如果没找到，尝试获取详情
            if (!this.currentClub) {
                console.log('本地未找到俱乐部，尝试获取详情');
                this.getClubDetail(clubId).then(clubDetail => {
                    if (clubDetail) {
                        this.currentClub = this.transformClubData(clubDetail);
                    }
                });
            }
        }
        
        console.log('当前俱乐部:', this.currentClub);
        return this.currentClub;
    },
    
    // 获取当前俱乐部
    getCurrentClub: function() {
        return this.currentClub;
    },
    
    // 检查是否是俱乐部创建者
    isClubOwner: function(clubId) {
        const club = this.myClubs.find(c => c.id === clubId);
        return club && club.memberRole === 'manager';
    },
    
    // 获取俱乐部成员数量
    getClubMembersCount: function(clubId) {
        const club = this.allClubs.find(c => c.id === clubId) || 
                    this.myClubs.find(c => c.id === clubId);
        return club ? club.members : 0;
    },
    
    // 渲染俱乐部列表
    renderClubList: function() {
    console.log('渲染俱乐部列表');
    
    const container = document.getElementById('club-list');
    if (!container) {
        console.error('俱乐部列表容器未找到');
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    if (!this.myClubs || this.myClubs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>暂无俱乐部</h3>
                <p>点击上方按钮创建或加入俱乐部</p>
            </div>
        `;
        return;
    }
    
    // 渲染俱乐部卡片
    this.myClubs.forEach(club => {
        // 根据memberRole显示标签
        let roleTag = '';
        if (club.memberRole === 'manager') {
            roleTag = '<span class="tag" style="background: linear-gradient(135deg, #fff7e6, #ffe7ba); color: #d46b08;">创建者</span>';
        } else if (club.memberRole === 'member') {
            roleTag = '<span class="tag" style="background: linear-gradient(135deg, #f6ffed, #d9f7be); color: #389e0d;">成员</span>';
        }
        
        // 标签显示
        const tagBadge = club.tag ? `<span class="tag" style="background: linear-gradient(135deg, #f0f0f0, #e0e0e0); color: #666;">${club.tag}</span>` : '';
        container.innerHTML += `
            <div class="club-card">
                <h3>${club.name}</h3>
                <div class="club-tags">
                    ${roleTag}
                    ${tagBadge}
                </div>
                <div style="font-size:13px; color:#999; margin-bottom:16px; display: flex; align-items: center; gap: 16px;">
                    <span><i class="fas fa-user"></i> 创建者：${club.creator}</span>
                    <span><i class="fas fa-users"></i> 成员：${club.members}人</span>
                </div>
                ${club.description ? `<div style="font-size:14px; color:#666; margin-bottom:12px; line-height:1.5;">${club.description}</div>` : ''}
                <div class="club-actions">
            <button class="btn btn-primary" style="flex:1" onclick="window.App.enterTaskPage()">
                <i class="fas fa-tasks"></i> 进入任务
            </button>
        </div>
            </div>
        `;
    });
    
    console.log('俱乐部列表渲染完成，共', this.myClubs.length, '个俱乐部');
}
};
