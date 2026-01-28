// 俱乐部管理模块
window.Clubs = {
    // 我的俱乐部列表
    myClubs: [],
    
    // 所有俱乐部数据库
    allClubs: [],
    
    // 当前选中的俱乐部
    currentClub: null,

    // 用户名缓存
    userNameCache: {},

    loadMyClubsPromise: null,
    
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
            { 
                id: 101, 
                name: "初中数学教研组", 
                creator: "王老师", 
                members: 12, 
                tag: "数学", 
                description: "初中数学教学研讨",
                joinPolicy: "free",
                joinConditions: null
            },
            { 
                id: 102, 
                name: "PBL项目式学习", 
                creator: "张老师", 
                members: 8, 
                tag: "综合", 
                description: "项目式学习方法研讨",
                joinPolicy: "approval",
                joinConditions: "仅限在职教师"
            }
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
        if (this.loadMyClubsPromise) {
            return this.loadMyClubsPromise;
        }
        this.loadMyClubsPromise = (async () => {
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
                        let creatorId = club.creatorId;
                        if (detail) {
                            const detailCreatorId = detail.creator && detail.creator.userId ? detail.creator.userId : detail.creatorId;
                            const detailCreatorName = detail.creator && detail.creator.username ? detail.creator.username : null;
                            if (detailCreatorName) {
                                creatorName = detailCreatorName;
                            } else if (detailCreatorId) {
                                creatorName = await this.getUserNameById(detailCreatorId);
                            }
                            creatorId = detailCreatorId || creatorId;
                        }
                        if (detail) {
                            const updatedClub = { ...club, creator: creatorName, creatorId: creatorId };
                            if (typeof detail.memberCount === 'number') {
                                updatedClub.members = detail.memberCount;
                            }
                            // 添加状态信息
                            if (detail.status) {
                                updatedClub.status = detail.status;
                                updatedClub.archived = detail.status === 'archived';
                            }
                            // 添加入会政策信息
                            if (detail.joinPolicy) {
                                updatedClub.joinPolicy = detail.joinPolicy;
                                updatedClub.joinConditions = detail.joinConditions;
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
        })();
        return this.loadMyClubsPromise.finally(() => {
            this.loadMyClubsPromise = null;
        });
    },
    
    // 搜索俱乐部（修复：正确处理API返回的list字段）
    searchClubs: async function(keyword) {
        try {
            console.log('搜索俱乐部，关键词:', keyword);
            // 从API搜索俱乐部 - 适配新的API格式
            const response = await API.getAllClubs({ keyword: keyword });
            
            if (response && response.code === 0 && response.data) {
                let clubsList = [];
                
                // 处理不同的数据结构
                if (Array.isArray(response.data)) {
                    // 如果data直接是数组
                    clubsList = response.data;
                } else if (response.data.list && Array.isArray(response.data.list)) {
                    // 如果data有list字段
                    clubsList = response.data.list;
                } else if (response.data.clubs && Array.isArray(response.data.clubs)) {
                    // 如果data有clubs字段
                    clubsList = response.data.clubs;
                } else {
                    console.warn('搜索俱乐部API返回格式不正确:', response.data);
                    return [];
                }
                
                // 过滤掉已加入的俱乐部和已归档的俱乐部
                const joinedIds = this.myClubs.map(club => club.id);
                
                const clubs = clubsList
                    .filter(club => {
                        // 过滤已归档
                        if (club.archived === true || club.status === 'archived') {
                            return false;
                        }
                        // 过滤已加入
                        if (joinedIds.includes(club.clubId || club.id)) {
                            return false;
                        }
                        return true;
                    })
                    .map(club => {
                        const creatorId = club.creator && club.creator.userId ? club.creator.userId : club.creatorId;
                        const creatorName = club.creator && club.creator.username ? club.creator.username : (club.creatorName || club.creator || '未知');
                        return ({
                        id: club.clubId || club.id,
                        name: club.name || club.clubName,
                        creatorId: creatorId,
                        creator: creatorName || '未知',
                        members: club.memberCount || club.members || 0,
                        tag: club.tag || '教研组',
                        description: club.description || '',
                        status: club.status || 'active',
                        archived: club.archived || false,
                        joinPolicy: club.joinPolicy || 'free',
                        joinConditions: club.joinConditions || null,
                        clubDetail: club // 保存原始数据
                    });
                    });
                
                // 获取创建者姓名
                const clubsWithCreator = await Promise.all(clubs.map(async club => {
                    if (club.creatorId && (!club.creator || club.creator === '未知')) {
                        try {
                            const creatorName = await this.getUserNameById(club.creatorId);
                            return { ...club, creator: creatorName };
                        } catch (error) {
                            console.warn('获取创建者姓名失败:', club.creatorId, error);
                            return { ...club, creator: `ID:${club.creatorId}` };
                        }
                    }
                    return club;
                }));
                
                console.log('搜索到的俱乐部:', clubsWithCreator);
                return clubsWithCreator;
            } else {
                console.warn('搜索俱乐部API返回错误:', response);
                return [];
            }
        } catch (error) {
            console.error('搜索俱乐部失败:', error);
            // 如果API失败，本地搜索
            const joinedIds = this.myClubs.map(club => club.id);
            return this.allClubs.filter(club => {
                if (joinedIds.includes(club.id)) return false;
                if (club.archived || club.status === 'archived') return false;
                const keywordLower = keyword.toLowerCase();
                return club.name.toLowerCase().includes(keywordLower) || 
                       club.tag.toLowerCase().includes(keywordLower) || 
                       club.id.toString().includes(keyword);
            });
        }
    },
    
    // 创建俱乐部
    createClub: async function(clubData) {
        try {
            console.log('创建俱乐部，数据:', clubData);
            
            // 构建API请求数据
            const requestData = {
                name: clubData.name,
                tag: clubData.tag || '教研组',
                description: clubData.description || ''
            };
            
            // 添加加入政策（如果提供了）
            if (clubData.joinPolicy) {
                requestData.joinPolicy = clubData.joinPolicy;
                if (clubData.joinConditions) {
                    requestData.joinConditions = clubData.joinConditions;
                }
            }
            
            // 调用API创建俱乐部
            const response = await API.createClub(requestData);
            
            console.log('API创建俱乐部响应:', response);
            
            if (response && response.code === 0) {
                // 创建成功，获取俱乐部详情
                const clubDetail = await this.getClubDetail(response.data.clubId);
                
                if (clubDetail) {
                    // 转换数据结构
                    const newClub = this.transformClubData(clubDetail);
                    newClub.memberRole = 'manager'; // 创建者自动成为manager
                    newClub.joinTime = new Date().toISOString();
                    newClub.status = 'active';
                    newClub.archived = false;
                    
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
        
        const creatorId = backendClub.creator && backendClub.creator.userId ? backendClub.creator.userId : backendClub.creatorId;
        const creatorName = backendClub.creator && backendClub.creator.username ? backendClub.creator.username : (backendClub.creatorName || backendClub.creator || '未知');
        return {
            id: backendClub.clubId || backendClub.id,
            name: backendClub.clubName || backendClub.name,
            memberRole: backendClub.memberRole || 'member', // 统一使用 memberRole
            creatorId: creatorId,
            creator: creatorName,
            members: backendClub.memberCount || backendClub.members || 1,
            tag: backendClub.tag || '',
            description: backendClub.description || '',
            joinTime: backendClub.joinTime || new Date().toISOString(),
            status: backendClub.status || 'active',
            archived: backendClub.archived || backendClub.status === 'archived',
            joinPolicy: backendClub.joinPolicy || 'free',
            joinConditions: backendClub.joinConditions || null
        };
    },
    
    // 加入俱乐部（新增审核流程）
    joinClub: async function(clubId, applyMessage = '') {
        // 先获取俱乐部详情，检查是否已归档
        try {
            const clubDetail = await this.getClubDetail(clubId);
            
            if (clubDetail && (clubDetail.archived || clubDetail.status === 'archived')) {
                return {
                    success: false,
                    message: '该俱乐部已归档，无法加入'
                };
            }
            
            console.log('加入俱乐部，ID:', clubId, '申请信息:', applyMessage);
            
            // 调用API加入俱乐部
            const response = await API.joinClub(clubId, { applyMessage });
            
            console.log('加入俱乐部API响应:', response);
            
            if (response && response.code === 0) {
                const resultData = response.data;
                
                if (resultData.status === 'joined') {
                    // 直接加入成功，获取俱乐部详情
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
                            message: `成功加入${joinedClub.name}！`,
                            status: 'joined'
                        };
                    }
                } else if (resultData.status === 'pending') {
                    // 申请已提交，等待审核
                    return {
                        success: true,
                        message: '已提交申请，等待管理员审核',
                        status: 'pending',
                        requestId: resultData.requestId,
                        clubId: clubId
                    };
                } else {
                    return {
                        success: false,
                        message: '未知的加入状态'
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

    // 获取入会申请列表（管理员用）
    getJoinRequests: async function(clubId, status = 'pending') {
        try {
            const response = await API.getJoinRequests(clubId, { status });
            if (response && response.code === 0) {
                return response.data.list || [];
            }
            return [];
        } catch (error) {
            console.error('获取入会申请列表失败:', error);
            return [];
        }
    },

    // 批准入会申请（管理员用）
    approveJoinRequest: async function(clubId, requestId) {
        try {
            const response = await API.approveJoinRequest(clubId, requestId);
            if (response && response.code === 0) {
                return { success: true, message: '已通过申请' };
            }
            return { success: false, message: response ? response.msg : '操作失败' };
        } catch (error) {
            console.error('批准入会申请失败:', error);
            return { success: false, message: error.message };
        }
    },

    // 驳回入会申请（管理员用）
    rejectJoinRequest: async function(clubId, requestId) {
        try {
            const response = await API.rejectJoinRequest(clubId, requestId);
            if (response && response.code === 0) {
                return { success: true, message: '已驳回申请' };
            }
            return { success: false, message: response ? response.msg : '操作失败' };
        } catch (error) {
            console.error('驳回入会申请失败:', error);
            return { success: false, message: error.message };
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
                creatorId: club.creatorId,
                creatorName: club.creator,
                creator: {
                    userId: club.creatorId || null,
                    username: club.creator || '未知'
                },
                memberCount: club.members,
                tag: club.tag,
                description: club.description,
                status: club.status || 'active',
                archived: club.archived || false,
                joinPolicy: club.joinPolicy || 'free',
                joinConditions: club.joinConditions || null
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
    
    isClubCreator: async function(clubId) {
        console.log('检查用户是否是俱乐部创建者，俱乐部ID:', clubId);
        
        // 1. 确保用户已登录
        if (!window.Auth || !window.Auth.isLoggedIn()) {
            console.log('用户未登录');
            return false;
        }
        
        // 2. 从 myClubs 中查找俱乐部
        const club = this.myClubs.find(c => {
            const cid = c.id || c.clubId || c.clubID;
            return parseInt(cid) === parseInt(clubId);
        });
        
        if (!club) {
            console.log('本地未找到俱乐部，尝试从API获取详情');
            try {
                const clubDetail = await this.getClubDetail(clubId);
                const creatorId = clubDetail && clubDetail.creator && clubDetail.creator.userId ? clubDetail.creator.userId : clubDetail.creatorId;
                if (creatorId) {
                    const currentUser = window.Auth.getUser();
                    return currentUser && currentUser.userId === creatorId;
                }
            } catch (error) {
                console.warn('从API获取俱乐部详情失败:', error);
            }
            return false;
        }
        
        // 3. 检查角色 - 根据API文档，创建者的角色是 'manager'
        const userRole = club.memberRole || club.role;
        const isCreator = userRole === 'manager';
        
        console.log(`俱乐部: ${club.name}, 用户角色: ${userRole}, 是否是创建者: ${isCreator}`);
        return isCreator;
    },

    // 设置当前俱乐部
    setCurrentClub: function(clubId) {
        console.log('设置当前俱乐部，ID:', clubId);
        
        // 如果 clubId 是数字，从我的俱乐部列表中查找
        if (typeof clubId === 'number' || (typeof clubId === 'string' && !isNaN(clubId))) {
            const id = parseInt(clubId);
            
            // 从 myClubs 中查找
            const foundClub = this.myClubs.find(c => {
                // 检查所有可能的ID属性
                return c.id === id || c.clubId === id || c.clubID === id;
            });
            
            if (foundClub) {
                this.currentClub = foundClub;
                console.log('从myClubs找到俱乐部:', this.currentClub);
            } else {
                // 如果没有找到，创建一个临时俱乐部对象
                console.log('本地未找到俱乐部，创建临时对象');
                this.currentClub = {
                    id: id,
                    clubId: id, // 确保有 clubId 属性
                    name: '临时俱乐部',
                    creator: '未知',
                    members: 0,
                    tag: '临时',
                    description: '',
                    status: 'active',
                    archived: false,
                    joinPolicy: 'free',
                    joinConditions: null
                };
            }
        } else if (typeof clubId === 'object') {
            // 如果是对象，直接设置为当前俱乐部
            this.currentClub = clubId;
            console.log('直接设置俱乐部对象:', this.currentClub);
        }
        
        // 确保有必要的属性
        if (this.currentClub) {
            // 确保有 id 和 clubId 属性
            if (!this.currentClub.id && this.currentClub.clubId) {
                this.currentClub.id = this.currentClub.clubId;
            }
            if (!this.currentClub.clubId && this.currentClub.id) {
                this.currentClub.clubId = this.currentClub.id;
            }
            
            console.log('最终设置的当前俱乐部:', this.currentClub);
            
            // 保存到本地存储，确保跨页面访问
            if (window.Utils) {
                Utils.saveToStorage('current_club', this.currentClub);
            }
        }
        
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
    
    renderClubList: function() {
        console.log('渲染俱乐部列表');
        
        const container = document.getElementById('club-list');
        if (!container) {
            console.error('俱乐部列表容器未找到');
            return;
        }
        
        // 清空容器
        container.innerHTML = '';
        
        // 如果没有俱乐部
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
        
        // 按状态分组：活跃俱乐部在前，归档俱乐部在后
        const activeClubs = this.myClubs.filter(club => !club.archived && club.status !== 'archived');
        const archivedClubs = this.myClubs.filter(club => club.archived || club.status === 'archived');
        
        // 渲染活跃俱乐部
        if (activeClubs.length > 0) {
            activeClubs.forEach(club => {
                this.renderClubCard(club, container, false);
            });
        }
        
        // 渲染归档俱乐部（如果有）
        // 渲染归档俱乐部（如果有）
        if (archivedClubs.length > 0) {
    // 添加归档俱乐部标题
    container.innerHTML += `
        <div style="grid-column: 1 / -1; margin: 40px 0 20px 0; border-top: 1px solid #eee; padding-top: 20px;">
            <h3 style="color: #999; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-archive"></i> 已归档俱乐部
            </h3>
            <p style="color: #999; font-size: 13px; margin-top: 4px;">已归档的俱乐部仍然可以查看任务，但不可加入新成员</p>
        </div>
    `;
    
    // 渲染归档俱乐部卡片
    archivedClubs.forEach(club => {
        this.renderClubCard(club, container, true);
    });
}
        
        console.log('俱乐部列表渲染完成，共', this.myClubs.length, '个俱乐部');
    },

    // 渲染单个俱乐部卡片
renderClubCard: function(club, container, isArchived) {
    console.log(`渲染俱乐部 ${club.name}:`, { 
        id: club.id, 
        name: club.name, 
        isArchived: isArchived,
        status: club.status 
    });
    
    // 根据是否归档设置卡片样式
    const cardClass = isArchived ? 'club-card archived' : 'club-card';
    const cardStyle = isArchived ? 'background: #fafafa; border-color: #e0e0e0; opacity: 0.9;' : '';
    
    // 根据memberRole显示标签
    let roleTag = '';
    if (club.memberRole === 'manager') {
        roleTag = '<span class="tag" style="background: linear-gradient(135deg, #fff7e6, #ffe7ba); color: #d46b08;">创建者</span>';
    } else if (club.memberRole === 'member') {
        roleTag = '<span class="tag" style="background: linear-gradient(135deg, #f6ffed, #d9f7be); color: #389e0d;">成员</span>';
    }
    
    // 归档标签
    const archiveTag = isArchived ? '<span class="tag" style="background: linear-gradient(135deg, #f0f0f0, #e0e0e0); color: #666;"><i class="fas fa-archive"></i> 已归档</span>' : '';
    
    // 标签显示
    const tagBadge = club.tag ? `<span class="tag" style="background: linear-gradient(135deg, #e6f7ff, #bae7ff); color: #096dd9;">${club.tag}</span>` : '';
    
    // 入会政策标签
    let policyTag = '';
    if (club.joinPolicy === 'approval') {
        policyTag = '<span class="tag" style="background: linear-gradient(135deg, #f0f0ff, #d6e4ff); color: #597ef7;"><i class="fas fa-user-check"></i> 需审核</span>';
    }
    
    let actionButtons = '';
    let archiveNotice = '';
    
    if (isArchived) {
        // 归档俱乐部：查看任务 + 恢复按钮
        actionButtons = `
            <div class="club-actions">
                <button class="btn btn-outline" onclick="goToVideoPage(${club.id})" style="flex:1">
                    <i class="fas fa-eye"></i> 查看任务
                </button>
                <button class="btn btn-primary" onclick="window.Clubs.restoreClub(${club.id})" style="flex:1">
                    <i class="fas fa-undo"></i> 恢复俱乐部
                </button>
            </div>
        `;
        
        // 归档提示
        archiveNotice = `<div style="font-size: 12px; color: #d46b08; padding: 6px 8px; background: rgba(250, 173, 20, 0.1); border-radius: 4px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-info-circle"></i>
            <span>已归档 - 可查看历史任务，不可加入新成员</span>
        </div>`;
    } else if (club.memberRole === 'manager') {
        // 活跃俱乐部创建者：查看任务 + 编辑 + 解散/归档
        actionButtons = `
            <div class="club-actions">
                <button class="btn btn-primary" onclick="goToVideoPage(${club.id})" style="flex:1">
                    <i class="fas fa-video"></i> 查看任务
                </button>
                <button class="btn btn-outline btn-sm" onclick="openEditClubModal(${club.id})" title="编辑俱乐部">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="window.Clubs.confirmArchiveOrDelete(${club.id})" title="解散或归档">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    } else if (club.memberRole === 'member') {
        // 活跃俱乐部成员：查看任务 + 退出
        actionButtons = `
            <div class="club-actions">
                <button class="btn btn-primary" onclick="goToVideoPage(${club.id})" style="flex:1">
                    <i class="fas fa-video"></i> 查看任务
                </button>
                <button class="btn btn-outline" onclick="quitClub(${club.id})">
                    <i class="fas fa-sign-out-alt"></i> 退出
                </button>
            </div>
        `;
    } else {
        // 默认：只有查看任务按钮
        actionButtons = `
            <div class="club-actions">
                <button class="btn btn-primary" onclick="goToVideoPage(${club.id})" style="width:100%">
                    <i class="fas fa-video"></i> 查看任务
                </button>
            </div>
        `;
    }
    
    // 如果有归档时间，显示归档时间
    const archiveTime = isArchived && club.archivedAt ? 
        `<div style="font-size: 12px; color: #999; margin-top: 8px;"><i class="fas fa-clock"></i> 归档于：${this.formatDate(club.archivedAt)}</div>` : '';
    
    // 入会条件说明
    const joinConditions = club.joinConditions ? 
        `<div style="font-size: 12px; color: #666; margin-top: 4px; padding: 4px 8px; background: #f5f5f5; border-radius: 4px;">
            <i class="fas fa-info-circle"></i> 入会条件：${club.joinConditions}
        </div>` : '';
    
    container.innerHTML += `
        <div class="${cardClass}" style="${cardStyle}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <h3 style="color: ${isArchived ? '#666' : 'inherit'}; margin: 0; font-size: 18px;">${club.name}</h3>
                ${isArchived ? '<i class="fas fa-archive" style="color: #999;"></i>' : ''}
            </div>
            <div class="club-tags">
                ${roleTag}
                ${archiveTag}
                ${policyTag}
                ${tagBadge}
            </div>
            <div style="font-size:13px; color:#999; margin-bottom:16px; display: flex; align-items: center; gap: 16px;">
                <span><i class="fas fa-user"></i> 创建者：${club.creator}</span>
                <span><i class="fas fa-users"></i> 成员：${club.members}人</span>
            </div>
            ${club.description ? `<div style="font-size:14px; color:#666; margin-bottom:12px; line-height:1.5;">${club.description}</div>` : ''}
            ${joinConditions}
            ${archiveNotice}
            ${archiveTime}
            ${actionButtons}
        </div>
    `;
},
    
    // 格式化日期
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    quitClub: async function(clubId) {
        if (!confirm('确定要退出这个俱乐部吗？退出后将无法查看俱乐部任务。')) {
            return;
        }
        
        try {
            Utils.showNotification('正在退出俱乐部...', 'info');
            
            // 调用API退出俱乐部
            const response = await API.quitClub(clubId);
            
            console.log('退出俱乐部API响应:', response);
            
            if (response && response.code === 0) {
                // 从我的俱乐部列表中移除
                this.myClubs = this.myClubs.filter(club => {
                    const cid = club.id || club.clubId || club.clubID;
                    return parseInt(cid) !== parseInt(clubId);
                });
                this.saveClubsToStorage();
                
                Utils.showNotification('已成功退出俱乐部', 'success');
                
                // 重新渲染俱乐部列表
                this.renderClubList();
            } else {
                Utils.showNotification(response?.msg || '退出俱乐部失败', 'error');
            }
        } catch (error) {
            console.error('退出俱乐部失败:', error);
            Utils.showNotification('退出俱乐部失败: ' + error.message, 'error');
        }
    },
    
    /**
     * 打开编辑俱乐部模态框
     * @param {number} clubId - 俱乐部ID
     */
    openEditClubModal: function(clubId) {
        // 首先验证权限
        if (!this.isClubCreator(clubId)) {
            Utils.showNotification('只有俱乐部创建者可以编辑俱乐部信息', 'error');
            return;
        }
        
        const club = this.myClubs.find(c => {
            const cid = c.id || c.clubId || c.clubID;
            return parseInt(cid) === parseInt(clubId);
        });
        
        if (!club) {
            Utils.showNotification('未找到俱乐部信息', 'error');
            return;
        }
        
        // 创建模态框HTML（动态添加到页面）
        const modalHTML = `
            <div id="edit-club-modal" class="modal-overlay" style="display: flex;">
                <div class="modal">
                    <h3 style="margin-bottom: 24px;"><i class="fas fa-edit"></i> 编辑俱乐部</h3>
                    <div class="form-item">
                        <label class="required">俱乐部名称</label>
                        <input type="text" id="edit-club-name" value="${club.name}" placeholder="请输入俱乐部名称">
                    </div>
                    <div class="form-item">
                        <label>标签</label>
                        <input type="text" id="edit-club-tag" value="${club.tag || '教研组'}" placeholder="标签">
                    </div>
                    <div class="form-item">
                        <label>简介</label>
                        <textarea id="edit-club-description" placeholder="请输入俱乐部简介" rows="3">${club.description || ''}</textarea>
                    </div>
                    <div class="form-item">
                        <label>加入方式</label>
                        <select id="edit-club-join-policy" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="free" ${club.joinPolicy === 'free' ? 'selected' : ''}>自由加入</option>
                            <option value="approval" ${club.joinPolicy === 'approval' ? 'selected' : ''}>需要审核</option>
                        </select>
                    </div>
                    <div class="form-item" id="edit-join-conditions-container" style="${club.joinPolicy === 'approval' ? '' : 'display: none;'}">
                        <label>加入条件说明</label>
                        <textarea id="edit-club-join-conditions" placeholder="请输入加入条件说明" rows="2">${club.joinConditions || ''}</textarea>
                    </div>
                    <div style="text-align:right; margin-top: 24px;">
                        <button class="btn btn-outline" onclick="window.Clubs.closeEditClubModal()">取消</button>
                        <button class="btn btn-primary" onclick="window.Clubs.updateClubInfo(${clubId})">保存修改</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        const modalContainer = document.getElementById('modal-container') || document.body;
        modalContainer.insertAdjacentHTML('beforeend', modalHTML);
        
        // 绑定点击外部关闭事件
        const modal = document.getElementById('edit-club-modal');
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                window.Clubs.closeEditClubModal();
            }
        });

        // 绑定选择变化事件
        const policySelect = document.getElementById('edit-club-join-policy');
        const conditionsContainer = document.getElementById('edit-join-conditions-container');
        
        if (policySelect && conditionsContainer) {
            policySelect.addEventListener('change', function() {
                conditionsContainer.style.display = this.value === 'approval' ? 'block' : 'none';
            });
        }
    },
    
    /**
     * 关闭编辑俱乐部模态框
     */
    closeEditClubModal: function() {
        const modal = document.getElementById('edit-club-modal');
        if (modal) {
            modal.remove();
        }
    },
    
    /**
     * 更新俱乐部信息
     * @param {number} clubId - 俱乐部ID
     */
    updateClubInfo: async function(clubId) {
        // 验证权限
        if (!this.isClubCreator(clubId)) {
            Utils.showNotification('权限不足', 'error');
            return;
        }
        
        const nameInput = document.getElementById('edit-club-name');
        const tagInput = document.getElementById('edit-club-tag');
        const descInput = document.getElementById('edit-club-description');
        const policySelect = document.getElementById('edit-club-join-policy');
        const conditionsInput = document.getElementById('edit-club-join-conditions');
        
        if (!nameInput || !policySelect) return;
        
        const name = nameInput.value.trim();
        const tag = tagInput ? tagInput.value.trim() : '教研组';
        const description = descInput ? descInput.value.trim() : '';
        const joinPolicy = policySelect.value;
        const joinConditions = joinPolicy === 'approval' && conditionsInput ? conditionsInput.value.trim() : null;
        
        if (!name) {
            Utils.showNotification('俱乐部名称不能为空', 'error');
            return;
        }
        
        try {
            Utils.showNotification('正在更新俱乐部信息...', 'info');
            
            // 调用API编辑俱乐部（PATCH方法）
            const response = await API.updateClub(clubId, {
                name: name,
                tag: tag,
                description: description,
                joinPolicy: joinPolicy,
                joinConditions: joinConditions
            });
            
            console.log('编辑俱乐部API响应:', response);
            
            if (response && response.code === 0) {
                // 更新本地俱乐部数据
                const clubIndex = this.myClubs.findIndex(c => {
                    const cid = c.id || c.clubId || c.clubID;
                    return parseInt(cid) === parseInt(clubId);
                });
                
                if (clubIndex !== -1) {
                    this.myClubs[clubIndex] = {
                        ...this.myClubs[clubIndex],
                        name: name,
                        tag: tag,
                        description: description,
                        joinPolicy: joinPolicy,
                        joinConditions: joinConditions
                    };
                    this.saveClubsToStorage();
                }
                
                Utils.showNotification('俱乐部信息更新成功', 'success');
                this.closeEditClubModal();
                this.renderClubList(); // 重新渲染列表
            } else {
                Utils.showNotification(response?.msg || '更新失败', 'error');
            }
        } catch (error) {
            console.error('更新俱乐部失败:', error);
            Utils.showNotification('更新失败: ' + error.message, 'error');
        }
    },
    
    /**
     * 确认解散或归档俱乐部
     * @param {number} clubId - 俱乐部ID
     */
    confirmArchiveOrDelete: function(clubId) {
        // 验证权限
        if (!this.isClubCreator(clubId)) {
            Utils.showNotification('只有俱乐部创建者可以解散或归档俱乐部', 'error');
            return;
        }
        
        const club = this.myClubs.find(c => {
            const cid = c.id || c.clubId || c.clubID;
            return parseInt(cid) === parseInt(clubId);
        });
        
        if (!club) return;
        
        // 创建选择解散或归档的对话框
        const modalHTML = `
            <div id="archive-delete-modal" class="modal-overlay" style="display: flex;">
                <div class="modal" style="max-width: 500px;">
                    <h3 style="margin-bottom: 20px;"><i class="fas fa-archive"></i> 俱乐部管理</h3>
                    
                    <div style="margin-bottom: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <i class="fas fa-users" style="font-size: 20px; color: #1890ff; margin-right: 10px;"></i>
                            <div>
                                <strong style="font-size: 16px;">${club.name}</strong>
                                ${club.tag ? `<div style="font-size: 13px; color: #666;">标签：${club.tag}</div>` : ''}
                            </div>
                        </div>
                        <div style="font-size: 13px; color: #666;">
                            <div><i class="fas fa-user"></i> 创建者：${club.creator}</div>
                            <div><i class="fas fa-users"></i> 成员：${club.members}人</div>
                            <div><i class="fas fa-sign-in-alt"></i> 加入方式：${club.joinPolicy === 'free' ? '自由加入' : '需要审核'}</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <h4 style="margin-bottom: 12px; color: #333;">请选择操作：</h4>
                        
                        <!-- 归档选项 -->
                        <div class="action-option" onclick="selectAction('archive')" id="archive-option" style="cursor: pointer;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f0f0f0, #e0e0e0); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                        <i class="fas fa-archive" style="color: #999;"></i>
                                    </div>
                                    <div>
                                        <strong style="color: #666;">归档俱乐部</strong>
                                        <div style="font-size: 13px; color: #999;">暂时关闭俱乐部，保留所有数据</div>
                                    </div>
                                </div>
                                <div class="action-radio" id="archive-radio"></div>
                            </div>
                        </div>
                        
                        <!-- 解散选项 -->
                        <div class="action-option" onclick="selectAction('delete')" id="delete-option" style="cursor: pointer; margin-top: 16px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="display: flex; align-items: center;">
                                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #fff2f0, #ffccc7); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                                        <i class="fas fa-trash" style="color: #ff4d4f;"></i>
                                    </div>
                                    <div>
                                        <strong style="color: #ff4d4f;">解散俱乐部</strong>
                                        <div style="font-size: 13px; color: #999;">永久删除俱乐部和所有数据</div>
                                    </div>
                                </div>
                                <div class="action-radio" id="delete-radio"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 操作后果说明 -->
                    <div id="consequence-info" style="padding: 12px; border-radius: 6px; margin-bottom: 20px; display: none;">
                        <div id="consequence-text"></div>
                    </div>
                    
                    <div style="text-align:right; margin-top: 24px;">
                        <button class="btn btn-outline" onclick="window.Clubs.closeArchiveDeleteModal()">取消</button>
                        <button class="btn btn-primary" id="confirm-action-btn" onclick="window.Clubs.executeSelectedAction(${clubId})" disabled>确认操作</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .action-option {
                padding: 16px;
                border: 2px solid #eee;
                border-radius: 8px;
                transition: all 0.2s;
            }
            
            .action-option:hover {
                border-color: #1890ff;
                background: rgba(24, 144, 255, 0.03);
            }
            
            .action-option.selected {
                border-color: #1890ff;
                background: rgba(24, 144, 255, 0.05);
            }
            
            .action-radio {
                width: 20px;
                height: 20px;
                border: 2px solid #ddd;
                border-radius: 50%;
                position: relative;
            }
            
            .action-radio.selected::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                background: #1890ff;
                border-radius: 50%;
            }
            
            .archive-consequence {
                background: rgba(0, 0, 0, 0.02);
                border-left: 4px solid #999;
            }
            
            .delete-consequence {
                background: rgba(255, 77, 79, 0.05);
                border-left: 4px solid #ff4d4f;
            }
        `;
        document.head.appendChild(style);
        
        // 初始化状态
        window.selectedAction = null;
        
        // 绑定点击外部关闭事件
        const modal = document.getElementById('archive-delete-modal');
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                this.closeArchiveDeleteModal();
            }
        }.bind(this));
    },
    
    // 选择操作
    selectAction: function(actionType) {
        window.selectedAction = actionType;
        
        // 更新UI
        const archiveOption = document.getElementById('archive-option');
        const deleteOption = document.getElementById('delete-option');
        const archiveRadio = document.getElementById('archive-radio');
        const deleteRadio = document.getElementById('delete-radio');
        const confirmBtn = document.getElementById('confirm-action-btn');
        const consequenceInfo = document.getElementById('consequence-info');
        const consequenceText = document.getElementById('consequence-text');
        
        // 重置所有选项
        [archiveOption, deleteOption].forEach(opt => opt.classList.remove('selected'));
        [archiveRadio, deleteRadio].forEach(radio => radio.classList.remove('selected'));
        
        if (actionType === 'archive') {
            archiveOption.classList.add('selected');
            archiveRadio.classList.add('selected');
            
            consequenceText.innerHTML = `
                <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                    <i class="fas fa-info-circle" style="color: #1890ff; margin-right: 8px; margin-top: 2px;"></i>
                    <div>
                        <strong>归档操作将：</strong>
                        <ul style="margin: 8px 0 0 20px; padding: 0;">
                            <li>俱乐部将变为灰色显示</li>
                            <li>其他用户无法再加入此俱乐部</li>
                            <li>保留所有成员、任务和数据，并可查看历史任务</li>
                            <li>创建者可以恢复</li>
                        </ul>
                    </div>
                </div>
            `;
            consequenceInfo.className = 'archive-consequence';
            consequenceInfo.style.display = 'block';
            
            confirmBtn.innerHTML = '<i class="fas fa-archive"></i> 确认归档';
            confirmBtn.className = 'btn btn-primary';
        } else if (actionType === 'delete') {
            deleteOption.classList.add('selected');
            deleteRadio.classList.add('selected');
            
            consequenceText.innerHTML = `
                <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
                    <i class="fas fa-exclamation-triangle" style="color: #ff4d4f; margin-right: 8px; margin-top: 2px;"></i>
                    <div>
                        <strong>解散操作将：</strong>
                        <ul style="margin: 8px 0 0 20px; padding: 0;">
                            <li>永久删除俱乐部</li>
                            <li>移除所有俱乐部成员</li>
                            <li>删除所有任务和视频数据</li>
                            <li>此操作不可撤销</li>
                        </ul>
                    </div>
                </div>
            `;
            consequenceInfo.className = 'delete-consequence';
            consequenceInfo.style.display = 'block';
            
            confirmBtn.innerHTML = '<i class="fas fa-trash"></i> 确认解散';
            confirmBtn.className = 'btn btn-danger';
        }
        
        // 启用确认按钮
        confirmBtn.disabled = false;
    },
    
    // 关闭归档/解散模态框
    closeArchiveDeleteModal: function() {
        const modal = document.getElementById('archive-delete-modal');
        if (modal) {
            modal.remove();
        }
        window.selectedAction = null;
    },
    
    // 执行选中的操作
    executeSelectedAction: async function(clubId) {
        const action = window.selectedAction;
        
        if (!action) {
            Utils.showNotification('请选择一个操作', 'error');
            return;
        }
        
        try {
            if (action === 'archive') {
                await this.archiveClub(clubId);
            } else if (action === 'delete') {
                await this.deleteClub(clubId);
            }
            
            this.closeArchiveDeleteModal();
        } catch (error) {
            console.error('执行操作失败:', error);
            Utils.showNotification('操作失败: ' + error.message, 'error');
        }
    },
    
    /**
     * 解散俱乐部
     * @param {number} clubId - 俱乐部ID
     */
    deleteClub: async function(clubId) {
        try {
            Utils.showNotification('正在解散俱乐部...', 'info');
            
            // 调用API解散俱乐部（DELETE方法）
            const response = await API.deleteClub(clubId);
            
            console.log('解散俱乐部API响应:', response);
            
            if (response && response.code === 0) {
                // 从我的俱乐部列表中移除
                this.myClubs = this.myClubs.filter(club => {
                    const cid = club.id || club.clubId || club.clubID;
                    return parseInt(cid) !== parseInt(clubId);
                });
                this.saveClubsToStorage();
                
                Utils.showNotification('俱乐部已解散', 'success');
                this.renderClubList(); // 重新渲染列表
            } else {
                Utils.showNotification(response?.msg || '解散俱乐部失败', 'error');
            }
        } catch (error) {
            console.error('解散俱乐部失败:', error);
            Utils.showNotification('解散俱乐部失败: ' + error.message, 'error');
        }
    },
    
    /**
     * 归档俱乐部
     * @param {number} clubId - 俱乐部ID
     */
    archiveClub: async function(clubId) {
        try {
            Utils.showNotification('正在归档俱乐部...', 'info');
            
            // 调用API归档俱乐部
            const response = await API.archiveClub(clubId, { status: 'archived' });
            
            console.log('归档俱乐部API响应:', response);
            
            if (response && response.code === 0) {
                // 更新本地俱乐部状态
                const clubIndex = this.myClubs.findIndex(c => {
                    const cid = c.id || c.clubId || c.clubID;
                    return parseInt(cid) === parseInt(clubId);
                });
                
                if (clubIndex !== -1) {
                    this.myClubs[clubIndex] = {
                        ...this.myClubs[clubIndex],
                        status: 'archived',
                        archived: true,
                        archivedAt: new Date().toISOString()
                    };
                    this.saveClubsToStorage();
                }
                
                Utils.showNotification('俱乐部已归档', 'success');
                this.renderClubList(); // 重新渲染列表
            } else {
                Utils.showNotification(response?.msg || '归档俱乐部失败', 'error');
            }
        } catch (error) {
            console.error('归档俱乐部失败:', error);
            Utils.showNotification('归档俱乐部失败: ' + error.message, 'error');
        }
    },
    
    /**
     * 恢复俱乐部
     * @param {number} clubId - 俱乐部ID
     */
    restoreClub: async function(clubId) {
        try {
            Utils.showNotification('正在恢复俱乐部...', 'info');
            
            // 调用API恢复俱乐部
            const response = await API.archiveClub(clubId, { status: 'active' });
            
            console.log('恢复俱乐部API响应:', response);
            
            if (response && response.code === 0) {
                // 更新本地俱乐部状态
                const clubIndex = this.myClubs.findIndex(c => {
                    const cid = c.id || c.clubId || c.clubID;
                    return parseInt(cid) === parseInt(clubId);
                });
                
                if (clubIndex !== -1) {
                    this.myClubs[clubIndex] = {
                        ...this.myClubs[clubIndex],
                        status: 'active',
                        archived: false,
                        archivedAt: null
                    };
                    this.saveClubsToStorage();
                }
                
                Utils.showNotification('俱乐部已恢复', 'success');
                this.renderClubList(); // 重新渲染列表
            } else {
                Utils.showNotification(response?.msg || '恢复俱乐部失败', 'error');
            }
        } catch (error) {
            console.error('恢复俱乐部失败:', error);
            Utils.showNotification('恢复俱乐部失败: ' + error.message, 'error');
        }
    },
    
    /**
     * 获取用户在俱乐部中的角色
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise<string>} 'manager' 或 'member'
     */
    getUserRoleInClub: async function(clubId) {
        try {
            // 检查是否是创建者
            const isCreator = await this.isClubCreator(clubId);
            return isCreator ? 'manager' : 'member';
        } catch (error) {
            console.error('获取用户角色失败:', error);
            return 'member'; // 默认作为成员
        }
    },
    
    /**
     * 检查任务是否可访问（非创建者需要顺序解锁）
     * @param {number} taskId - 任务ID
     * @param {Array} allTasks - 所有任务数组
     * @param {number} clubId - 俱乐部ID
     * @returns {Promise<boolean>} 是否可访问
     */
    isTaskAccessible: async function(taskId, allTasks, clubId) {
        // 1. 获取用户角色
        const userRole = await this.getUserRoleInClub(clubId);
        
        // 2. 如果是创建者，所有任务都可用
        if (userRole === 'manager') {
            return true;
        }
        
        // 3. 如果是普通成员，按顺序检查
        const user = window.Auth.getUser();
        if (!user || !allTasks || !Array.isArray(allTasks)) {
            return false;
        }
        
        // 按创建时间排序任务
        const sortedTasks = [...allTasks].sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeA - timeB;
        });
        
        // 找到当前任务在列表中的位置
        const currentIndex = sortedTasks.findIndex(task => 
            (task.taskId || task.id) === taskId
        );
        
        if (currentIndex <= 0) {
            // 第一个任务总是可访问
            return true;
        }
        
        // 检查之前的所有任务是否都已完成
        for (let i = 0; i < currentIndex; i++) {
            const previousTask = sortedTasks[i];
            const taskDetail = await Tasks.getTaskDetail(previousTask.taskId || previousTask.id);
            
            if (taskDetail && taskDetail.taskInfo && Array.isArray(taskDetail.taskInfo.subTasks)) {
                // 检查两个子任务是否都已完成
                const subTasks = taskDetail.taskInfo.subTasks;
                const watchTask = subTasks.find(st => st.type === 'watch');
                const researchTask = subTasks.find(st => st.type === 'research');
                
                // 两个子任务都必须完成
                if (!watchTask || watchTask.status !== 'completed' || 
                    !researchTask || researchTask.status !== 'completed') {
                    return false; // 前面的任务未完成，当前任务不可访问
                }
            } else {
                // 如果获取不到子任务信息，假设未完成
                return false;
            }
        }
        
        return true;
    }
};
