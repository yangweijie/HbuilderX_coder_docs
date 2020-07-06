var hx = require("hbuilderx");
var fs = require('fs');
var path = require("path");

//该方法将在插件激活的时候调用
function activate(context) {
	let disposable = hx.commands.registerCommand('extension.helloWorld', () => {
		var current_dir = __dirname;
		let uri = path.join(__dirname, 'str.html');
		console.log(uri);
		var html = fs.readFileSync(uri, 'utf8');
		console.log(html);
		hx.window.showInformationMessage(html);
	});
	//订阅销毁钩子，插件禁用的时候，自动注销该command。
	context.subscriptions.push(disposable);
}
//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

}
module.exports = {
	activate,
	deactivate
}
