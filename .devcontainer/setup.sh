gh codespace ports visibility 9090:public -c $CODESPACE_NAME
gh codespace ports visibility 8080:public -c $CODESPACE_NAME
gh codespace ports visibility 3000:public -c $CODESPACE_NAME
gh codespace ports visibility 3001:public -c $CODESPACE_NAME
gh codespace ports visibility 4318:public -c $CODESPACE_NAME
echo "gh codespace ports -c $CODESPACE_NAME" >> ~/.bashrc