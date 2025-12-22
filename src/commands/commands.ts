/* global Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    // 命令处理逻辑
  }
});

function onExecute(event: Office.AddinCommands.Event) {
  // 执行命令
  event.completed();
}

// 注册命令处理函数
Office.actions.associate("action", onExecute);

