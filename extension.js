var hx = require("hbuilderx");
var fs = require('fs');
const http = require('http');
var path = require("path");
var iconv = require('iconv-lite');
var ostype;
const os = require('os');
var AdmZip = require('@zwg/adm-zip');

const pluginName = '程序员手册';
let outputChannel;
let webviewPanel;
let support_webview;


//统一调试
function openDebugChannel() {
	outputChannel = hx.window.createOutputChannel(pluginName);
	outputChannel.show();
}

function debugLog(str) {
	outputChannel.appendLine((typeof str == "object") ? JSON.stringify(str) : str);
}

function setStatusMsg(msg, autohide = 2000) {
	hx.window.setStatusBarMessage('<span style="color:#3366ff">' + pluginName + '：</span>' + msg);
}

//统一通知
function showInformation(msg, title, buttons = []) {
	if (!title) title = pluginName;
	var str = '<span style="color:#3366ff">' + title + '</span><br>' + msg;
	return hx.window.showInformationMessage(str, buttons);
}

function downloadFile(url, dest, callbacks) {
	if (!callbacks) callbacks = {};

	if (fs.existsSync(dest)) {
		debugLog(dest + "已存在");
		if (callbacks.success) callbacks.success();
		return;
	}

	debugLog("准备将" + url + "下载至" + dest);
	const file = fs.createWriteStream(dest);

	http.get(url, (res) => {
		if (res.statusCode !== 200) {
			if (callbacks.fail) callbacks.fail(res);
			return;
		}

		const bytestotal = parseInt(res.headers['content-length'], 10);
		let bytesloaded = 0;
		debugLog("文件大小：" + bytestotal);

		res.on('end', () => {
			if (callbacks.success) callbacks.success();
		});
		res.on('data', (data) => {
			const data_len = parseInt(data.length, 10);
			bytesloaded += data_len;
			debugLog("已下载大小：" + bytesloaded);
			if (callbacks.progress) callbacks.progress(bytesloaded, bytestotal);
		});

		file.on('finish', () => {
			file.close();
		}).on('error', (err) => {
			fs.unlink(dest);
		});

		res.pipe(file);
	});
}

function docList(){
	var current_dir = __dirname;
	let uri = path.join(__dirname, '/features/default.json');
	let data = fs.readFileSync(uri, 'utf8');
	debugLog(data);
	return data;
}

function getToken(code){
	var current_dir = __dirname;
	let uri = path.join(__dirname, '/index/'+code+'.json');
	let data = fs.readFileSync(uri, 'utf8');
	let data_arr = JSON.parse(data);
	let items = [];
	for (let item in data_arr) {
		let code = data_arr[item];
		code.label = code.name;
		// <span style="background-image:url(${icon});width:20px;height:20px;"></span>
		// debugLog(item, doc_list_arr[item]); // js 遍历对象属性 获得的是key 不是对象
		items.push(code);
	}
	hx.window.showQuickPick(items, {
		placeHolder: "请选择您要查看的关键词"
	}).then(function(result) {
		if (!result) {
			return;
		}
		let text = result.path;
		debugLog("您选择的内容是：", text);
		showContent(code, text);
	});
}

// function showContent(code, file){
// 	var current_dir = __dirname;
// 	let uri = path.join(current_dir, `/docs/`+ file);
// 	debugLog(uri);
// 	var html = fs.readFileSync(uri, 'utf8');
// 	hx.window.showInformationMessage(html);
// }

function downDoc(file){
	var url = `http://yangweijie.cn/uploads/docs/${file}.zip`;
	var dest = path.join(__dirname, `/docs/${file}.zip`);
	downloadFile(url, dest, {
		success:()=>{
			setStatusMsg(`${file}手册已下载`);
			var zip = new AdmZip(dest);
			zip.extractAllTo(path.join(__dirname, `/docs/`), /*overwrite*/true);
			setStatusMsg(`${file}手册已解压`);
		},
		progress: (bytesloaded, bytestotal) => {
			setStatusMsg(file+"手册下载进度：" + (bytesloaded / bytestotal * 100).toFixed(2) + "%");
		}
	});
}

function showContent(code, file){
	var version = hx.env.appVersion;
	var to_compare = version.split('.');
	to_compare = `${to_compare[0]}.${to_compare[1]}.${to_compare[2]}`;
	support_webview = to_compare >= '2.8.1';
	
	var current_dir = __dirname;
	hx.workspace.openTextDocument(path.join(current_dir, `/preview.md`));
	let uri = path.join(current_dir, `/docs/`+ file);
	debugLog(uri);
	// hx.workspace.openTextDocument(uri);
	// return ;
	var html = fs.readFileSync(uri, 'utf8');
	debugLog(html);
	if(support_webview){
		debugLog('支持webview');
		if(!webviewPanel){
			hx.window.showInformationMessage('请通过菜单“视图-插件扩展视图-手册内容打开视图展示结果”');
			webviewPanel = hx.window.createWebView("extension.coderDocsShowContent",{
				enableScritps:true
			});
			console.log(hx.window);
		}
		// console.log('webviewPanel');
		// console.log(webviewPanel);
		// console.log('webviewPanel._webView');
		// console.log(webviewPanel._webView);
		console.log('webviewPanel.webView');
		console.log(webviewPanel.webView);
		let webview = webviewPanel.webView;
		// console.log(webview);
		var background = '';
		
		let config = hx.workspace.getConfiguration();
		let colorScheme = config.get('editor.colorScheme');
		if (colorScheme == 'Monokai') {
		    background = 'rgb(39,40,34)'
		} else if (colorScheme == 'Atom One Dark') {
		    background = 'rgb(40,44,53)'
		} else {
		    background = 'rgb(255,250,232)'
		};
		
		webview.html = html;
		webview.postMessage({
		    command: "test"
		});
		webview.onDidReceiveMessage((msg) => {
		    if (msg.command == 'alert') {
		        hx.window.showInformationMessage(msg.text);
		    }
		});
	}else{
		const http = require('http');
		// var html = 'asd';
		var qs=require('querystring');
		var post_data={html:html} //提交的数据
		var content=qs.stringify(post_data);
		 
		var options = {
		  host: 'yangweijie.cn',
		  port: 80,
		  path: '/api/docset/html2md',
		  method: 'POST',
		  headers:{
			'Content-Type':'application/x-www-form-urlencoded',
			'Content-Length':content.length
		  }
		};
		debugLog("post options:\n",options);
		debugLog("content:",content);
		debugLog("\n");  
		var req = http.request(options, function(res) {
			debugLog("statusCode: ", res.statusCode);
			debugLog("headers: ", res.headers);
			var _data='';
			  res.on('data', function(chunk){
				 _data += chunk;
			  });
			res.on('end', function(){
				debugLog("\n--->>\nresult:",_data);
				let editorPromise = hx.window.getActiveTextEditor();
				editorPromise.then((editor)=>{
					let workspaceEdit = new hx.WorkspaceEdit();
					let edits = [];
					edits.push(new hx.TextEdit({
						start: 0,
						end: 0
					}, _data));
			
					workspaceEdit.set(editor.document.uri,edits);
					hx.workspace.applyEdit(workspaceEdit);
				});
			});
		});
		req.on('error', function(e){
			debugLog('请求遇到问题: '+e.message);
		});
		req.write(content);
		req.end();
	}	
	// hx.window.showInformationMessage(html);
	
}

//该方法将在插件激活的时候调用
function activate(context) {
	openDebugChannel();
	debugLog("好戏开始了：" + Date.now());
	ostype = os.type;
	debugLog("当前系统为" + ostype);
	
	
	let search = hx.commands.registerCommand('extension.coderDocsSearch', () => {
		let config = hx.workspace.getConfiguration();
		if(config.get('coderDocs.current') === undefined){
			debugLog('没有配置过');
			hx.window.showErrorMessage('没有配置过当前查看的手册');
			return;
		}
		let code = config.get('coderDocs.current') || 'php';
		let current_dir = __dirname;
		if(!fs.existsSync(path.join(current_dir, `/docs/${code}`))){
			hx.window.showErrorMessage(`${code}手册缺失，将自动下载`);
			downDoc(code);
			// return;
		}
		getToken(code);
	});
	//订阅销毁钩子，插件禁用的时候，自动注销该command。
	let config = hx.commands.registerCommand('extension.coderDocsConfig', () => {
		let doc_list = docList();
		let items = [];
		let doc_list_arr = JSON.parse(doc_list);
		for (let item in doc_list_arr) {
			let code = doc_list_arr[item].features.code;
			items.push({
				label: `<span style="color:red">${code}</span>`,
				// description: `123`,
				code : doc_list_arr[item].features.code
			});
		}
		hx.window.showQuickPick(items, {
			placeHolder: "请选择您要查询的手册"
		}).then(function(result) {
			if (!result) {
				return;
			}
			if(support_webview && webviewPanel){
				webviewPanel.dispose();
				webviewPanel = undefined;
			}
			let text = code = result.code;
			debugLog("您选择的内容是：", text);
			let config = hx.workspace.getConfiguration();
			config.update('coderDocs.current', result.code);
			let current_dir = __dirname;
			if(!fs.existsSync(path.join(current_dir, `/docs/${code}`))){
				hx.window.showErrorMessage(`${code}手册缺失，将自动下载`);
				downDoc(code);
				// return;
			}
		});
	});
	context.subscriptions.push(search);
	context.subscriptions.push(config);
}
//该方法将在插件禁用的时候调用（目前是在插件卸载的时候触发）
function deactivate() {

}
module.exports = {
	activate,
	deactivate
}
