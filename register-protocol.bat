@echo off
chcp 65001
set "PROTOCOL=midoci30429744"
:: 替换为你的 Electron 路径（项目下的 electron 可执行文件）
set "ELECTRON_EXE=%cd%\node_modules\.bin\electron.cmd"
:: 替换为你的项目根目录（绝对路径，不要有空格/中文）
set "APP_DIR=D:\app\my-vue-app2"

echo 正在注册协议 %PROTOCOL%...
:: 写入注册表
reg add "HKEY_CURRENT_USER\Software\Classes\%PROTOCOL%" /ve /d "URL:%PROTOCOL% Protocol" /f
reg add "HKEY_CURRENT_USER\Software\Classes\%PROTOCOL%" /v "URL Protocol" /d "" /f
reg add "HKEY_CURRENT_USER\Software\Classes\%PROTOCOL%\shell\open\command" /ve /d "\"%ELECTRON_EXE%\" \"%APP_DIR%\" \"%%1\"" /f

if %errorlevel% equ 0 (
  echo 协议 %PROTOCOL% 注册成功！
) else (
  echo 协议注册失败，请以管理员身份运行！
)
pause