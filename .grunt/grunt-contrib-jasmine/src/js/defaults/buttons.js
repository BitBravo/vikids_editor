
var __cov_Q5Aj0t_WUAdUBszoRptzUA = (Function('return this'))();
if (!__cov_Q5Aj0t_WUAdUBszoRptzUA.__coverage__) { __cov_Q5Aj0t_WUAdUBszoRptzUA.__coverage__ = {}; }
__cov_Q5Aj0t_WUAdUBszoRptzUA = __cov_Q5Aj0t_WUAdUBszoRptzUA.__coverage__;
if (!(__cov_Q5Aj0t_WUAdUBszoRptzUA['src/js/defaults/buttons.js'])) {
   __cov_Q5Aj0t_WUAdUBszoRptzUA['src/js/defaults/buttons.js'] = {"path":"src/js/defaults/buttons.js","s":{"1":0,"2":0},"b":{},"f":{"1":0},"fnMap":{"1":{"name":"(anonymous_1)","line":1,"loc":{"start":{"line":1,"column":1},"end":{"line":1,"column":13}}}},"statementMap":{"1":{"start":{"line":1,"column":0},"end":{"line":258,"column":5}},"2":{"start":{"line":7,"column":4},"end":{"line":256,"column":6}}},"branchMap":{}};
}
__cov_Q5Aj0t_WUAdUBszoRptzUA = __cov_Q5Aj0t_WUAdUBszoRptzUA['src/js/defaults/buttons.js'];
__cov_Q5Aj0t_WUAdUBszoRptzUA.s['1']++;(function(){'use strict';__cov_Q5Aj0t_WUAdUBszoRptzUA.f['1']++;__cov_Q5Aj0t_WUAdUBszoRptzUA.s['2']++;MediumEditor.extensions.button.prototype.defaults={'bold':{name:'bold',action:'bold',aria:'bold',tagNames:['b','strong'],style:{prop:'font-weight',value:'700|bold'},useQueryState:true,contentDefault:'<b>B</b>',contentFA:'<i class="fa fa-bold"></i>'},'italic':{name:'italic',action:'italic',aria:'italic',tagNames:['i','em'],style:{prop:'font-style',value:'italic'},useQueryState:true,contentDefault:'<b><i>I</i></b>',contentFA:'<i class="fa fa-italic"></i>'},'underline':{name:'underline',action:'underline',aria:'underline',tagNames:['u'],style:{prop:'text-decoration',value:'underline'},useQueryState:true,contentDefault:'<b><u>U</u></b>',contentFA:'<i class="fa fa-underline"></i>'},'strikethrough':{name:'strikethrough',action:'strikethrough',aria:'strike through',tagNames:['strike'],style:{prop:'text-decoration',value:'line-through'},useQueryState:true,contentDefault:'<s>A</s>',contentFA:'<i class="fa fa-strikethrough"></i>'},'superscript':{name:'superscript',action:'superscript',aria:'superscript',tagNames:['sup'],contentDefault:'<b>x<sup>1</sup></b>',contentFA:'<i class="fa fa-superscript"></i>'},'subscript':{name:'subscript',action:'subscript',aria:'subscript',tagNames:['sub'],contentDefault:'<b>x<sub>1</sub></b>',contentFA:'<i class="fa fa-subscript"></i>'},'image':{name:'image',action:'image',aria:'image',tagNames:['img'],contentDefault:'<b>image</b>',contentFA:'<i class="fa fa-picture-o"></i>'},'html':{name:'html',action:'html',aria:'evaluate html',tagNames:['iframe','object'],contentDefault:'<b>html</b>',contentFA:'<i class="fa fa-code"></i>'},'orderedlist':{name:'orderedlist',action:'insertorderedlist',aria:'ordered list',tagNames:['ol'],useQueryState:true,contentDefault:'<b>1.</b>',contentFA:'<i class="fa fa-list-ol"></i>'},'unorderedlist':{name:'unorderedlist',action:'insertunorderedlist',aria:'unordered list',tagNames:['ul'],useQueryState:true,contentDefault:'<b>&bull;</b>',contentFA:'<i class="fa fa-list-ul"></i>'},'indent':{name:'indent',action:'indent',aria:'indent',tagNames:[],contentDefault:'<b>&rarr;</b>',contentFA:'<i class="fa fa-indent"></i>'},'outdent':{name:'outdent',action:'outdent',aria:'outdent',tagNames:[],contentDefault:'<b>&larr;</b>',contentFA:'<i class="fa fa-outdent"></i>'},'justifyCenter':{name:'justifyCenter',action:'justifyCenter',aria:'center justify',tagNames:[],style:{prop:'text-align',value:'center'},contentDefault:'<b>C</b>',contentFA:'<i class="fa fa-align-center"></i>'},'justifyFull':{name:'justifyFull',action:'justifyFull',aria:'full justify',tagNames:[],style:{prop:'text-align',value:'justify'},contentDefault:'<b>J</b>',contentFA:'<i class="fa fa-align-justify"></i>'},'justifyLeft':{name:'justifyLeft',action:'justifyLeft',aria:'left justify',tagNames:[],style:{prop:'text-align',value:'left'},contentDefault:'<b>L</b>',contentFA:'<i class="fa fa-align-left"></i>'},'justifyRight':{name:'justifyRight',action:'justifyRight',aria:'right justify',tagNames:[],style:{prop:'text-align',value:'right'},contentDefault:'<b>R</b>',contentFA:'<i class="fa fa-align-right"></i>'},'removeFormat':{name:'removeFormat',aria:'remove formatting',action:'removeFormat',contentDefault:'<b>X</b>',contentFA:'<i class="fa fa-eraser"></i>'},'quote':{name:'quote',action:'append-blockquote',aria:'blockquote',tagNames:['blockquote'],contentDefault:'<b>&ldquo;</b>',contentFA:'<i class="fa fa-quote-right"></i>'},'pre':{name:'pre',action:'append-pre',aria:'preformatted text',tagNames:['pre'],contentDefault:'<b>0101</b>',contentFA:'<i class="fa fa-code fa-lg"></i>'},'h1':{name:'h1',action:'append-h1',aria:'header type one',tagNames:['h1'],contentDefault:'<b>H1</b>',contentFA:'<i class="fa fa-header"><sup>1</sup>'},'h2':{name:'h2',action:'append-h2',aria:'header type two',tagNames:['h2'],contentDefault:'<b>H2</b>',contentFA:'<i class="fa fa-header"><sup>2</sup>'},'h3':{name:'h3',action:'append-h3',aria:'header type three',tagNames:['h3'],contentDefault:'<b>H3</b>',contentFA:'<i class="fa fa-header"><sup>3</sup>'},'h4':{name:'h4',action:'append-h4',aria:'header type four',tagNames:['h4'],contentDefault:'<b>H4</b>',contentFA:'<i class="fa fa-header"><sup>4</sup>'},'h5':{name:'h5',action:'append-h5',aria:'header type five',tagNames:['h5'],contentDefault:'<b>H5</b>',contentFA:'<i class="fa fa-header"><sup>5</sup>'},'h6':{name:'h6',action:'append-h6',aria:'header type six',tagNames:['h6'],contentDefault:'<b>H6</b>',contentFA:'<i class="fa fa-header"><sup>6</sup>'}};}());
