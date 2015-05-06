// Simulate the bare minimum of the view that exists on the main site
var Scratch = Scratch || {};
Scratch.FlashApp = Scratch.FlashApp || {};

function handleEmbedStatus(e) {
    $('#scratch-loader').hide();
    var scratch = $('#editor');
    if (!e.success) {
        scratch.css('marginTop', '10');
        scratch.find('IMG.proj_thumb').css('width', '179px');
        scratch.find('DIV.scratch_unsupported').show();
        scratch.find('DIV.scratch_loading').hide();
    } else {
        Scratch.FlashApp.ASobj = scratch[0];
    }
}

// enables the SWF to log errors
function JSthrowError(e) {
    if (window.onerror) window.onerror(e, 'swf', 0);
    else console.error(e);
}

function JSeditorReady() {
    try {
        handleParameters();
        JSeditorReadyCallback();
        return true;
    } catch (error) {
        console.error(error.message, "\n", error.stack);
        throw error;
    }
}

function JSprojectLoaded() {
    loadExtensionQueue();
}

var extensionQueue = [];
function handleParameters() {
    var project;
    var queryString = window.location.search.substring(1);
    var queryVars = queryString.split(/[&;]/);
    for (var i = 0; i < queryVars.length; i++) {
        var nameVal = queryVars[i].split('=');
        switch(nameVal[0]){
            case 'ext':
                extensionQueue.push(nameVal[1]);
                break;
            case 'proj':
                project = nameVal[1];
                break;
        }
    }
    if (project) {
        Scratch.FlashApp.ASobj.ASloadSBXFromURL(project);
    }
    else {
        loadExtensionQueue();
    }
}

function loadExtensionQueue() {
    for (var i = 0; i < extensionQueue.length; ++i) {
        var extensionURL = extensionQueue[i];
        ScratchExtensions.loadExternalJS(extensionURL);
    }
    extensionQueue = [];
}

var flashVars = {
    autostart: 'false',
    extensionDevMode: 'true',
    server: encodeURIComponent(location.host),
    cloudToken: '4af4863d-a921-4004-b2cb-e0ad00ee1927',
    cdnToken: '34f16bc63e8ada7dfd7ec12c715d0c94',
    urlOverrides: {
        sitePrefix: "http://scratch.mit.edu/",
        siteCdnPrefix: "http://cdn.scratch.mit.edu/",
        assetPrefix: "http://assets.scratch.mit.edu/",
        assetCdnPrefix: "http://cdn.assets.scratch.mit.edu/",
        projectPrefix: "http://projects.scratch.mit.edu/",
        projectCdnPrefix: "http://cdn.projects.scratch.mit.edu/",
        internalAPI: "internalapi/",
        siteAPI: "site-api/",
        staticFiles: "scratchr2/static/"
    },
    inIE: (navigator.userAgent.indexOf('MSIE') > -1)
};

var params = {
    allowscriptaccess: 'always',
    allowfullscreen: 'true',
    wmode: 'direct',
    menu: 'false'
};

$.each(flashVars, function (prop, val) {
    if ($.isPlainObject(val))
        flashVars[prop] = encodeURIComponent(JSON.stringify(val));
});

swfobject.switchOffAutoHideShow();

swfobject.embedSWF('Scratch.swf', 'editor', '100%', '100%', '11.7.0', 'libs/expressInstall.swf',
        flashVars, params, null, handleEmbedStatus);


/* File uploads */
var JSeditorReadyCallback = function(){};
function sendFileToFlash() {
    var fileReader = new FileReader();
    fileReader.onload = function (e) {
        var fileAsB64 = ab_to_b64(fileReader.result);
        if (Scratch.FlashApp.ASobj.ASloadBase64SBX !== undefined) {
            Scratch.FlashApp.ASobj.ASloadBase64SBX(fileAsB64);
        } else {
            JSeditorReadyCallback = function() {
                Scratch.FlashApp.ASobj.ASloadBase64SBX(fileAsB64);
            }        
        }
        
    }
    fileReader.readAsArrayBuffer(this.files[0]);
    showPage("editor");
}

$("[data-action='load-file']").click(function(e) {
    $('<input type="file" />').on('change', sendFileToFlash).click();
});

function sendURLtoFlash(url) {
    showPage("editor");
    if (Scratch.FlashApp.ASobj.ASloadSBXFromURL !== undefined) {
        Scratch.FlashApp.ASobj.ASloadSBXFromURL(url);
    } else {
        JSeditorReadyCallback = function() {
            Scratch.FlashApp.ASobj.ASloadSBXFromURL(url);
        }        
    }
}

$("[data-action='load-url']").submit(function(e) {
    e.preventDefault();
    sendURLtoFlash($('input[type="text"]', this).val());
});


/* Page switching */

$("[data-staticlink]").click(function(e) {
    e.preventDefault();
    var path = $(this).attr("data-staticlink");
    showPage(path);
});

function showPage(path) {
    var toHide = "body > main, body > main > article, #editor";
    var toShow = "#" + path;

    $(toHide).hide();
    $("body > main, body > main > article").has(toShow).show();
    $(toShow).show();

    window.location.hash = toShow;
    if ($("body > main > article").has(toShow).length == 0) {
        document.body.scrollTop = 0;
    }
}

var initialID = "home";
function initPage() {
    if (window.location.hash) initialID = window.location.hash.substr(1);
    showPage(initialID);
}
$(initPage);
