var hx = require("hbuilderx");
var fs = require('fs');
const http = require('http');
var path = require("path");
const unzip = require("unzip");
var yauzl = require("yauzl");
var iconv = require('iconv-lite');
var ostype;
const os = require('os');

const pluginName = '程序员手册';
let outputChannel;


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
	console.log(data);
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
		// console.log(item, doc_list_arr[item]); // js 遍历对象属性 获得的是key 不是对象
		items.push(code);
	}
	hx.window.showQuickPick(items, {
		placeHolder: "请选择您要查看的关键词"
	}).then(function(result) {
		if (!result) {
			return;
		}
		let text = result.path;
		console.log("您选择的内容是：", text);
		showContent(code, text);
	});
}

// function showContent(code, file){
// 	var current_dir = __dirname;
// 	let uri = path.join(current_dir, `/docs/`+ file);
// 	console.log(uri);
// 	var html = fs.readFileSync(uri, 'utf8');
// 	hx.window.showInformationMessage(html);
// }

function downDoc(file){
	var url = `http://yangweijie.cn/uploads/docs/${file}.zip`;
	var dest = path.join(__dirname, `/docs/${file}.zip`);
	downloadFile(url, dest, {
		success:()=>{
			setStatusMsg(`${file}手册已下载`);
			yauzl.open(dest, {lazyEntries: true}, function(err, zipfile) {
			let target_dir = path.join(__dirname, `/docs/`);
			  if (err) throw err;
			  zipfile.readEntry();
			  zipfile.on("entry", function(entry) {
				entry.fileName = iconv.decode(entry.fileName, 'GBK');
			    if (/\/$/.test(entry.fileName)) {
			      if(!fs.existsSync(path.join(target_dir,entry.fileName))){
			        fs.mkdirSync(path.join(target_dir,entry.fileName));
			      }
			      zipfile.readEntry();
			    } else {
			      zipfile.openReadStream(entry, function(err, readStream) {
			        if (err) throw err;
			        readStream.on("end", function() {
			          zipfile.readEntry();
			        });
			        readStream.pipe(fs.createWriteStream(path.join(target_dir, entry.fileName)));
			      });
			    }
			  }).on("close",function(){
			    console.log("解压完成");
			  });
			});
			
			
			// if (ostype == "Darwin") {
			// 	let download_pan = showInformation("下载已完成，您的系统无法自动解压缩，请手动解压后重启HBuilderX", "", [
			// 		"打开目录"
			// 	]);
			// 	download_pan.then((result) => {
			// 		hx.env.openExternal("file://" + path.posix.join(__dirname, `/docs/${file}`));
			// 	});
			// } else {
			// 	setStatusMsg("正在解压缩...");
			// 	var extract = unzip.Extract({
			// 		path: path.posix.join(__dirname, '/docs/')
			// 	});
			// 	extract.on('finish', function() {
			// 		setStatusMsg("解压完毕");
			// 	});
			// 	extract.on('error', function(err) {
			// 		debugLog(err);
			// 	});
			// 	fs.createReadStream(dest).pipe(extract);
			// }
		},
		progress: (bytesloaded, bytestotal) => {
			setStatusMsg(file+"手册下载进度：" + (bytesloaded / bytestotal * 100).toFixed(2) + "%");
		}
	});
}

function showContent(code, file){
	var current_dir = __dirname;
	hx.workspace.openTextDocument(path.join(current_dir, `/preview.md`));
	let uri = path.join(current_dir, `/docs/`+ file);
	console.log(uri);
	// hx.workspace.openTextDocument(uri);
	// return ;
	var html = fs.readFileSync(uri, 'utf8');
	
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
	console.log("post options:\n",options);
	console.log("content:",content);
	console.log("\n");  
	var req = http.request(options, function(res) {
		console.log("statusCode: ", res.statusCode);
		console.log("headers: ", res.headers);
		var _data='';
		  res.on('data', function(chunk){
			 _data += chunk;
		  });
		res.on('end', function(){
			console.log("\n--->>\nresult:",_data);
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
		console.log('请求遇到问题: '+e.message);
	});
	req.write(content);
	req.end();
	console.log(html);
	
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
			console.log('没有配置过');
			hx.window.showErrorMessage('没有配置过当前查看的手册');
			return;
		}
		let code = config.get('coderDocs.current') || 'php';
		let current_dir = __dirname;
		if(!fs.existsSync(path.join(current_dir, `/docs/${code}`))){
			hx.window.showErrorMessage(`${code}手册缺失，将自动下载`);
			downDoc(code);
			return;
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
				description: `123`,
				code : doc_list_arr[item].features.code
			});
		}
		hx.window.showQuickPick(items, {
			placeHolder: "请选择您要查询的手册"
		}).then(function(result) {
			if (!result) {
				return;
			}
			let text = result.code;
			console.log("您选择的内容是：", text);
			let config = hx.workspace.getConfiguration();
			config.update('coderDocs.current', result.code);
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
