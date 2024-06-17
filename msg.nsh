!macro customInit
  MessageBox MB_OK "Please avoid installing on the C: drive unless it is your only option."
!macroend

!macro customInstall
  ; Add context menu item for files
  WriteRegStr HKCR "*\\shell\\Send with Ship\\command" "" '"$INSTDIR\Ship.exe" "%1"'
!macroend

!macro customUnInstall
  ; Remove context menu item for files
  DeleteRegKey HKCR "*\\shell\\Send with Ship"
!macroend
