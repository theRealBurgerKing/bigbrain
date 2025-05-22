# BigBrain Quiz Platform - 项目描述
*A Real-time Quiz Platform Built with React.js - 基于 React.js 的实时竞答平台*

## Project Overview / 项目概述

BigBrain is a modern, interactive quiz platform that enables administrators to create, manage, and conduct real-time quiz sessions while allowing players to join and participate from any device. The platform features a comprehensive admin dashboard and an intuitive player interface.

BigBrain 是一个现代化的交互式竞答平台，管理员可以创建、管理和主持实时竞答会话，玩家可以从任何设备加入并参与竞答。该平台具有全面的管理仪表板和直观的玩家界面。

## Technology Stack / 技术栈

- **Frontend**: React.js (Single Page Application)
- **Backend**: RESTful API (provided)
- **Authentication**: JWT-based admin authentication
- **Real-time Communication**: Session-based game management
- **Testing**: Component testing (Vitest) + UI testing (Cypress/Playwright)

## Core Features / 核心功能

### 1. Admin Authentication System / 管理员认证系统

**Admin Registration & Login / 管理员注册与登录**
- Secure user registration with email, password, and name validation
- 安全的用户注册，包含邮箱、密码和姓名验证
- Login functionality with proper error handling
- 登录功能，具备完善的错误处理机制
- Password confirmation during registration
- 注册时的密码确认功能
- Persistent logout functionality across all screens
- 所有界面都具备持久化登出功能
![image](https://github.com/user-attachments/assets/2fd66cb7-611b-472d-8669-7c64f2e948c5)
![image](https://github.com/user-attachments/assets/d222c6bd-7866-477e-8ff8-be9b320788d8)
### 2. Game Management System / 游戏管理系统

**Game Dashboard / 游戏仪表板**
- Comprehensive dashboard displaying all created games
- 显示所有已创建游戏的综合仪表板
- Real-time game creation without page refresh
- 无需刷新页面的实时游戏创建
- Game metadata display (name, question count, thumbnail, duration)
- 游戏元数据显示（名称、题目数量、缩略图、时长）
- Direct navigation to game editing interfaces
- 直接导航到游戏编辑界面
![image](https://github.com/user-attachments/assets/fa3124ad-a95f-435e-9042-358ca85cbf10)
**Advanced Game Editing / 高级游戏编辑**
- Multi-level question management system
- 多层级题目管理系统
- Support for three question types:
- 支持三种题目类型：
  - **Single Choice** / 单选题: One correct answer from multiple options
  - **Multiple Choice** / 多选题: Multiple correct answers, all must be selected
  - **Judgment** / 判断题: True/false questions
- Rich media support (YouTube videos, image uploads)
- 富媒体支持（YouTube 视频、图片上传）
- Flexible answer configuration (2-6 answers per question)
- 灵活的答案配置（每题 2-6 个答案）
- Time limits and point values for each question
- 每题的时间限制和分值设置
![image](https://github.com/user-attachments/assets/c9aa2462-aa63-409b-9bb0-78ba3505d4fb)
![image](https://github.com/user-attachments/assets/9bccc494-bba5-4f3e-8eae-86c83767341c)
![image](https://github.com/user-attachments/assets/6155436f-2d1a-465a-b20d-fb297cec5dbf)
### 3. Real-time Session Management / 实时会话管理

**Session Control / 会话控制**
- One-click game session initialization
- 一键游戏会话初始化
- Unique session ID generation with clipboard sharing
- 唯一会话 ID 生成，支持剪贴板分享
- Pre-populated join URLs for seamless player access
- 预填充加入链接，便于玩家无缝访问
- Real-time session status monitoring
- 实时会话状态监控
![image](https://github.com/user-attachments/assets/a07074f2-d1ae-411c-8e2e-48b4bd736c7a)
![image](https://github.com/user-attachments/assets/d380b685-6cee-48c0-a965-1ee6c6b47ba0)
**Live Game Administration / 实时游戏管理**
- Question advancement control during active sessions
- 活跃会话期间的题目推进控制
- Session termination with player notification
- 会话终止并通知玩家
- Mid-question progression capabilities
- 题目进行中的推进功能

### 4. Player Experience / 玩家体验

**Seamless Join Process / 无缝加入流程**
- Multiple join methods (direct URL or session ID entry)
- 多种加入方式（直接链接或输入会话 ID）
- Custom player name registration
- 自定义玩家姓名注册
- Lobby system with pleasant waiting experience
- 具有愉快等待体验的大厅系统
![image](https://github.com/user-attachments/assets/9073ad3f-5025-4def-bb97-f67bde4b9696)
![image](https://github.com/user-attachments/assets/16a4838a-fda4-4de1-9ddd-94e8aeae2531)
**Interactive Gameplay / 互动游戏体验**
- Real-time question display with media content
- 实时题目显示，包含媒体内容
- Visual countdown timers for each question
- 每题的可视化倒计时器
- Immediate answer submission and modification
- 即时答案提交和修改
- Live answer revelation after time expires
- 时间到期后的实时答案揭晓
 ![image](https://github.com/user-attachments/assets/d305181b-d0b9-45e3-a863-4c62eecce4c4)
![image](https://github.com/user-attachments/assets/abfa48a6-d9fe-47bc-a57c-add1403cc3f6)
### 5. Comprehensive Results & Analytics / 全面的结果与分析

**Player Performance Tracking / 玩家表现跟踪**
- Individual question performance metrics
- 单题表现指标
- Response time analysis for each question
- 每题的响应时间分析
- Personal score breakdown and ranking
- 个人得分明细和排名

**Administrative Analytics / 管理分析**
- Top 5 player leaderboard display
- 前 5 名玩家排行榜显示
- Question accuracy statistics with visual charts
- 题目正确率统计及可视化图表
- Average response time analytics
- 平均响应时间分析
- Historical session data access
- 历史会话数据访问
![image](https://github.com/user-attachments/assets/9016712c-863d-4283-a644-9172a461f10b)
## Advanced Features / 高级特性

### Enhanced Points System / 增强积分系统
- Speed-based scoring algorithm combining accuracy and response time
- 基于速度的评分算法，结合准确性和响应时间
- Transparent scoring explanation on results screens
- 结果界面上的透明评分说明
![image](https://github.com/user-attachments/assets/ae0b807c-6401-4ebc-a9a7-ddd2f9e8b32c)
### Bulk Game Creation / 批量游戏创建
- CSV/JSON file upload for complete game data import
- CSV/JSON 文件上传，完整游戏数据导入
- Frontend data validation before backend submission
- 后端提交前的前端数据验证

### Historical Data Management / 历史数据管理
- Access to previous session results
- 访问历史会话结果
- Session comparison and analysis tools
- 会话对比和分析工具
 ![image](https://github.com/user-attachments/assets/7b12834e-1303-4893-8385-9a1b1698ffbd)
## Technical Requirements / 技术要求

### Development Standards / 开发标准
- **Single Page Application**: No page refreshes required
- **单页应用**：无需页面刷新
- **Responsive Design**: Optimal experience across all devices
- **响应式设计**：所有设备上的最佳体验
- **Error Handling**: Comprehensive error management and user feedback
- **错误处理**：全面的错误管理和用户反馈
- **Code Quality**: ESLint compliance with zero warnings/errors
- **代码质量**：ESLint 合规，零警告/错误

### Testing Strategy / 测试策略
- **Component Testing**: Individual component unit tests with high coverage
- **组件测试**：单个组件单元测试，高覆盖率
- **UI Testing**: End-to-end user journey testing
- **UI 测试**：端到端用户旅程测试
- **Test Scenarios**: Complete admin workflow from registration to results
- **测试场景**：从注册到结果的完整管理员工作流

## User Journey Examples / 用户旅程示例

### Admin Workflow / 管理员工作流
1. **Registration/Login** → **注册/登录**
2. **Create New Game** → **创建新游戏**
3. **Add/Edit Questions** → **添加/编辑题目**
4. **Start Game Session** → **开始游戏会话**
5. **Share Session Link** → **分享会话链接**
6. **Advance Questions** → **推进题目**
7. **View Results & Analytics** → **查看结果与分析**

### Player Workflow / 玩家工作流
1. **Join via Link/Session ID** → **通过链接/会话ID加入**
2. **Enter Player Name** → **输入玩家姓名**
3. **Wait in Lobby** → **在大厅等待**
4. **Answer Questions** → **回答问题**
5. **View Individual Results** → **查看个人结果**

## Project Goals / 项目目标

This platform demonstrates modern web development practices while creating an engaging, real-time interactive experience. It showcases advanced React.js patterns, state management, real-time communication, and comprehensive testing methodologies.

该平台展示了现代 Web 开发实践，同时创造了引人入胜的实时交互体验。它展示了高级 React.js 模式、状态管理、实时通信和全面的测试方法。

The BigBrain platform serves as both an educational tool and an entertainment system, suitable for classrooms, corporate training, social events, and competitive gaming scenarios.

BigBrain 平台既是教育工具也是娱乐系统，适用于课堂、企业培训、社交活动和竞技游戏场景。

- For certain requests you may want to "poll" the backend, i.e. have the friend end repeatedly make an API call every 1 second to check for updates.
- Make sure you navigated to the correct directory when installing dependencies.
