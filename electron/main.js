const { app, BrowserWindow, ipcMain, dialog, shell, Menu, protocol } = require('electron')

const path = require('path')
const fs = require('fs')
const os = require('os')
const { Console } = require('console')

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
const TOKEN_PATH = path.join(app.getPath('userData'), 'token.json');
let mainWindow

// 解析协议链接的通用方法
function parseProtocolUrl(urlStr) {
  try {
    console.log("[parseProtocolUrl] 开始处理协议链接:", urlStr);

    // 确保URL格式正确
    if (!urlStr.includes('://')) {
      urlStr = 'midoci30429744://' + urlStr.replace('midoci30429744:', '');
    }

    const url = new URL(urlStr);
    const token = url.searchParams.get('token');
    const nick = url.searchParams.get('nick');
    console.log("[parseProtocolUrl] 解析结果:", { token: !!token, nick: !!nick });

    if (token && nick) {
      fs.writeFileSync(
        TOKEN_PATH,
        JSON.stringify({
          token,
          nick,
          expireTime: new Date().getTime() + 7 * 24 * 60 * 60 * 1000
        }),
        'utf8'
      );
      console.log("Token已保存");

      if (mainWindow) {
        // 确保窗口已准备好
        setTimeout(() => {
          mainWindow.webContents.send('login-success', { token, nick });
          console.log("已发送 login-success 事件");
        }, 100);
      }
    } else {
      console.error('未找到token或nick参数');
    }

    // 唤起主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    } else {
      // 确保窗口创建完成
      setTimeout(() => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          createWindow();
        }
      }, 50);
    }
  } catch (error) {
    console.error('[parseProtocolUrl] 处理协议URL时出错:', error);
  }
}

const isDev = true

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    minWidth: 800,
    minHeight: 500,
    frame: true,
    resizable: true,
    title: '定制宝',
    backgroundColor: '#000',
    icon: path.join(__dirname, '../public/icon.png'), // 添加这一行
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: isDev,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false,
    skipTaskbar: false
  })

  console.log("窗口创建完成")

  // 窗口创建完成后再显示
  mainWindow.on('ready-to-show', () => {
    mainWindow.center()
    mainWindow.show()
    console.log("窗口已显示")
  })

  if (isDev) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.openDevTools();
    });
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 监听窗口准备状态
  mainWindow.webContents.on('dom-ready', () => {
    console.log("窗口DOM准备就绪")
  })
}

// ========== 修正协议注册：确保返回正确格式的响应 ==========
function registerProtocol() {
  console.log("开始注册协议")
  app.whenReady().then(() => {
    console.log('Electron 版本:', process.versions.electron);

    const isProtocolHandleAvailable = typeof protocol.handle === 'function';
    console.log('isProtocolHandleAvailable', isProtocolHandleAvailable);

    // 为MAC系统特别处理
    if (isProtocolHandleAvailable) {
      protocol.handle('midoci30429744', (request) => {
        console.log('[protocol.handle] 收到协议请求:', {
          url: request.url,
          method: request.method,
          headers: request.headers,
          urlLength: request.url.length
        });

        // 异步解析URL，避免阻塞响应
        setTimeout(() => {
          parseProtocolUrl(request.url);
        }, 0);

        // 返回正确的Response对象（MAC需要这个）
        return new Response('', {
          status: 200,
          headers: {
            'content-type': 'text/html',
            'content-length': '0'
          }
        });
      });
      console.log('协议注册成功（handle 方式）');

    } else {
      console.log('使用 registerStringProtocol');

      // 对于旧版本Electron，使用回调方式
      protocol.registerStringProtocol('midoci30429744', (request, callback) => {
        console.log('[registerStringProtocol] 收到协议请求:', {
          url: request.url,
          urlLength: request.url.length
        });

        // 异步解析URL
        setTimeout(() => {
          parseProtocolUrl(request.url);
        }, 0);

        // 返回一个最小的HTML响应，避免socket错误
        callback({
          mimeType: 'text/html',
          data: '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>'
        });
      });
      console.log('协议注册成功（registerStringProtocol 方式）');
    }
  });
}

// ========== 单实例逻辑 ==========
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log("另一个实例正在运行，退出当前实例");
  app.quit();
} else {
  console.log("获得单实例锁");

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('second-instance 事件触发，命令行参数:', commandLine);

    // 提取并处理协议链接
    const protocolUrl = commandLine.find(arg => arg && arg.startsWith('midoci30429744://'));
    console.log('捕获到协议链接:', protocolUrl);

    if (protocolUrl) {
      // 确保窗口已创建并准备好
      if (!mainWindow || mainWindow.isDestroyed()) {
        createWindow();
      }

      // 延迟处理，确保窗口完全就绪
      setTimeout(() => {
        parseProtocolUrl(protocolUrl);
      }, 300);
    } else {
      // 没有协议链接，只是唤起窗口
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
      } else {
        createWindow();
      }
    }
  });
}

// 全局存储 token 的方法
function saveToken(token, nick) {
  if (!token) return;
  try {
    fs.writeFileSync(
      TOKEN_PATH,
      JSON.stringify({
        token,
        nick,
        expireTime: new Date().getTime() + 7 * 24 * 60 * 60 * 1000
      }),
      'utf8'
    );
    if (mainWindow) {
      mainWindow.webContents.send('login-success', { token, nick });
    }
  } catch (e) {
    console.error('保存token失败:', e);
  }
}

// ========== IPC 事件处理 ==========
ipcMain.handle('logout', () => {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
});

ipcMain.handle('open-login-page', async () => {
  const loginUrl = `https://oauth.taobao.com/authorize?response_type=code&client_id=30429744&redirect_uri=https%3A%2F%2Fewstest.midoci.com%2Fauthorize%2Fcallback%2F30429744%3Fredirect_param%3DredirectApp&state=midoci&view=web`;
  await shell.openExternal(loginUrl);
});

ipcMain.handle('get-login-token', () => {
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      if (tokenData.expireTime > new Date().getTime()) {
        return tokenData;
      } else {
        fs.unlinkSync(TOKEN_PATH);
        return null;
      }
    } catch (e) {
      fs.unlinkSync(TOKEN_PATH);
      return null;
    }
  }
  return null;
});


// ========== 应用生命周期 ==========
app.whenReady().then(() => {
  console.log('=== 应用启动检查 ===');
  Menu.setApplicationMenu(null);

  // MAC上需要先设置协议客户端
  if (process.platform === 'darwin') {
    console.log('运行在MAC系统上，设置默认协议客户端');
    const success = app.setAsDefaultProtocolClient('midoci30429744');
    console.log('设置默认协议客户端结果:', success);

    // 监听open-url事件（MAC特有）
    app.on('open-url', (event, url) => {
      event.preventDefault();
      console.log('MAC open-url 事件触发:', url);

      if (url && url.startsWith('midoci30429744://')) {
        // 确保窗口已创建
        if (!mainWindow || mainWindow.isDestroyed()) {
          createWindow();
        }

        // 延迟处理
        setTimeout(() => {
          parseProtocolUrl(url);
        }, 500);
      }
    });
  }

  // Windows上的协议处理
  if (process.platform === 'win32') {
   let success =  app.setAsDefaultProtocolClient('midoci30429744');

    // 添加详细的协议处理器
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        success= app.setAsDefaultProtocolClient('midoci30429744', process.execPath, [
          path.resolve(process.argv[1])
        ]);
      }
    } else {
       success= app.setAsDefaultProtocolClient('midoci30429744');
    }
    console.log('Windows设置默认协议客户端结果:123', success);
  }

  // 注册协议处理器
  registerProtocol();

  // 创建窗口
  createWindow();

  app.on('activate', () => {
    console.log('activate事件触发');
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(error => {
  console.error('应用初始化失败:', error);
});

// ========== 命令行参数处理 ==========
// 处理启动时的命令行参数（包含协议链接）
app.on('ready', () => {
  console.log('app ready事件触发');

  // 检查启动参数是否包含协议链接
  const args = process.argv;
  console.log('启动参数:', args);

  const protocolUrl = args.find(arg => arg && arg.startsWith('midoci30429744://'));
  if (protocolUrl && mainWindow) {
    console.log('启动时发现协议链接，延迟处理:', protocolUrl);
    setTimeout(() => {
      parseProtocolUrl(protocolUrl);
    }, 1000);
  }
});

app.on('window-all-closed', () => {
  console.log('所有窗口已关闭');
  ipcMain.removeAllListeners();
  if (process.platform !== 'darwin') {
    console.log('非macOS平台，退出应用');
    app.quit();
  }
});

app.on('quit', () => {
  console.log('应用退出');
  ipcMain.removeAllListeners();
});

// ========== 错误处理 ==========
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});