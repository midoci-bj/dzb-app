!macro customInstall
  ; 注册协议处理器
  WriteRegStr HKCU "Software\Classes\midoci30429744" "" "URL:定制宝协议"
  WriteRegStr HKCU "Software\Classes\midoci30429744" "URL Protocol" ""
  WriteRegStr HKCU "Software\Classes\midoci30429744\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCU "Software\Classes\midoci30429744\shell" "" ""
  WriteRegStr HKCU "Software\Classes\midoci30429744\shell\open" "" ""
  WriteRegStr HKCU "Software\Classes\midoci30429744\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  
  ; 设置友好的应用名称
  WriteRegStr HKCU "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}" "FriendlyAppName" "定制宝客户端"
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\midoci30429744"
  DeleteRegKey HKCU "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}"
!macroend