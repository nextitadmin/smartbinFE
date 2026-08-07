(function () {
  this.config = {
    url: "https://checkout.usepay4it.com",
    host: window.location.hostname,
    version: "0.3.0",
  };

  //load the module
  this.load = function () {
    docFrag = document.createDocumentFragment();
    var _ = this;
    _.url = this.config.url;
    _.content = null;
    _.content = document.createElement("iframe");
    _.content.setAttribute("id", "load-seerbit-frame");
    _.content.setAttribute("src", _.url);
    _.content.style.position = "fixed";
    _.content.style.backgroundColor = "transparent";
    _.content.style.display = "block";
    _.content.style.visibility === "hidden";

    var container = document.querySelector("body");

    if (container) {
      docFrag.appendChild(_.content);

      container.appendChild(_.content);

      document.querySelector("iframe#load-seerbit-frame").onload = function () {
        console.log("loaded in browser");
        document.querySelector("iframe#load-seerbit-frame").style.display =
          "none";
      };
    }
  };

  //alert(JSON.stringify(this.config));
  if (this.config.host !== "pay.seerbitapi.com" && this.config.host !== "") {
    this.load();
  }

  // Define our constructor
  this.Pay4it = function () {
    // Create global element references
    var _ = this;
    _.url = this.config.url;
    _.contentHolder = null;
    _.loader = null;

    // Define option defaults
    var defaults = {
      //   currency: "NGN",
      //   country: "NG",
      version: this.config.version,
    };

    // console.log(window.Sentry);

    var mess = null;
    var handleTimeout;

    _.loaded && !document.querySelector("iframe#seerbit-frame")
      ? (_.loaded = null)
      : "";

    //PAYMENT_OBJECT
    if (arguments[0] && typeof arguments[0] === "object") {
      _.options = extendDefaults(defaults, arguments[0]);
      _.close_prompt = _.options.close_prompt;
      _.close_on_success = _.options.close_on_success;
      _.options.publicKey = _.options.public_key;
      _.options.script = true;
      _.options.ios =
        navigator.userAgent.indexOf("iOS") > -1 ||
        navigator.userAgent.indexOf("iPhone") > -1;
      _.options.test =
        _.options.public_key && (_.options.public_key.includes("TEST-Key"));
      _.options.payLink = !(
        _.options.email &&
        _.options.amount &&
        _.report_link !== ""
      );

      _.url =
        _.options.tokenize === true
          ? "https://checkout.usepay4it.com"
          : this.config.url;

      // console.log(_.options);
      if (!options.tranref) {
        alert("tranref is not defined");
        return;
      } else if (!options.public_key) {
        alert("public_key is not defined");
        return;
      } else if (!options.setAmountByCustomer && !options.amount) {
        alert("amount is not defined");
        return;
      }
      options.setAmountByCustomer && options.amount && delete options.amount;
    }

    //CALLBACK()
    if (arguments[1] && typeof arguments[1] === "function") {
      _.callback = arguments[1];
    }

    // CLOSE()
    if (arguments[2] && typeof arguments[2] === "function") {
      _.closeSB = arguments[2];
    }

    //TRANSACTION STATUS
    // if (arguments[3] && typeof arguments[3] === "function") {
    //   _.getStatus = arguments[3];
    // }

    //TRIGGER EVENT
    if (arguments[3] && typeof arguments[3] === "function") {
      _.events = arguments[3];
    }

    // HANDLE LOAD MODAL
    if (!_.loaded) {
      buildOut.call(_);
    }

    initializeEvents.call(_);

    function buildOut() {
      var docFrag,
        style,
        ref,
        // Create a DocumentFragment to build with
        docFrag = document.createDocumentFragment();

      // Create modal element
      _.contentHolder = document.createElement("iframe");
      _.contentHolder.setAttribute("id", "seerbit-framex");
      // _.contentHolder.setAttribute("src", _.url);
      _.contentHolder.style.width = "100%";
      _.contentHolder.style.height = "100%";
      _.contentHolder.style.position = "fixed";
      _.contentHolder.setAttribute("allow", "clipboard-read; clipboard-write");
      _.contentHolder.style.zIndex = "99999";
      _.contentHolder.style.top = "0";
      _.contentHolder.style.left = "0";
      _.contentHolder.style.borderWidth = "0";
      // _.contentHolder.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
      // _.contentHolder.style.display = "none";

      if (
        !_.options.email &&
        !_.options.fullName &&
        _.options.customization &&
        _.options.customization.confetti === false &&
        _.options.customization.theme &&
        _.options.customization.theme.border_color === "#d3d3d3" &&
        _.options.customization.theme.button_color === "#23085a" &&
        (_.options.version === "0.3.0" || _.options.version === "0.2.0")
      ) {
        _.contentHolder.style.display = "none";
        _.options.frame = true;
      }

      if (_.options.report_link && _.options.report_link.length > 0) {
        _.contentHolder.style.backgroundColor = "#F0F0F0";
      } else if (!(_.options.email && _.options.amount)) {
        _.contentHolder.style.backgroundColor = "#F0F0F0";
      } else if (_.options.email && _.options.amount) {
        _.contentHolder.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
      }

      _.contentHolderx = document.createElement("iframe");
      _.contentHolderx.setAttribute("id", "seerbit-frame");
      _.contentHolderx.setAttribute("src", _.url);
      _.contentHolderx.setAttribute("allow", "clipboard-read; clipboard-write");
      _.contentHolderx.style.width = "100%";
      _.contentHolderx.style.height = "100%";
      _.contentHolderx.style.position = "fixed";
      _.contentHolderx.style.zIndex = "99999";
      _.contentHolderx.style.top = "0";
      _.contentHolderx.style.left = "0";
      _.contentHolderx.style.borderWidth = "0";
      // _.contentHolderx.style.backgroundColor = "transparent";
      _.contentHolderx.style.display = "block";
      _.contentHolderx.style.visibility = "hidden";
      _.contentHolderx.style.opacity = "0";

      docFrag.appendChild(_.contentHolder);
      docFrag.appendChild(_.contentHolderx);

      // Create loader element
      _.loader = document.createElement("div");
      _.loader.appendChild(document.createElement("div"));
      _.loader.appendChild(document.createElement("div"));
      _.loader.appendChild(document.createElement("div"));
      _.loader.appendChild(document.createElement("div"));
      _.loader.setAttribute("id", "seerbit-loader");
      _.loader.setAttribute("class", "lds-ring");
      _.loader.style.display = "block";

      docFrag.appendChild(_.loader);

      style = document.createElement("style");
      style.innerHTML = `.lds-ring {
          display: inline-block;
          position: fixed;
          top: 20%;
          left: 47%;
          width: 54px;
          height: 54px;
          z-index: 10000000;
        }
        .lds-ring div {
          box-sizing: border-box;
          display: block;
          position: absolute;
          top: 0px;
          width: 31px;
          height: 31px;
          margin: 6px;
          border: 2px solid ${_.options.payLink ||
          (_.options.report_link && _.options.report_link.length > 0)
          ? "#000000"
          : "#ffffff"
        };
          border-radius: 50%;
          animation: lds-ring 0.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: ${_.options.payLink ||
          (_.options.report_link && _.options.report_link.length > 0)
          ? "#000000"
          : "#ffffff"
        } transparent transparent transparent;
        }
        .lds-ring div:nth-child(1) {
          animation-delay: -0s;
        }
        .lds-ring div:nth-child(2) {
          animation-delay: -0.05s;
        }
        .lds-ring div:nth-child(3) {
          animation-delay: -0.1s;
        }
        @keyframes lds-ring {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }`;

      var container =
        document.querySelector("#seerbit-pay") !== null
          ? document.querySelector("#seerbit-pay")
          : document.querySelector(".seerbit-pay")
            ? document.querySelector(".seerbit-pay")
            : document.querySelector("body");
      container.appendChild(_.contentHolder);
      container.appendChild(_.contentHolderx);
      container.appendChild(_.loader);
      container.appendChild(style);
    }

    function initializeEvents() {
      if (!_.loaded)
        if (_.addEventListener) {
          _.addEventListener("message", seerbitReceiveMessage, !1);
        } else {
          _.attachEvent("onmessage", seerbitReceiveMessage);
        }

      if (_.loaded) document.querySelector("iframe#seerbit-frame").src += "";
      //   document.querySelector("div#seerbit-loader").style.display = "block";
      document.querySelector("iframe#seerbit-frame").onload = function () {
        // document.querySelector("iframe#seerbit-frame").style.display = "block";
        var iframeWin = document.querySelector(
          "iframe#seerbit-frame"
        ).contentWindow;

        // document.querySelector("iframe#seerbit-frame").style.display = "block";
        if (!_.options.frame) {
          document.querySelector("iframe#seerbit-framex").style.display =
            "block";
        }

        // document.querySelector("iframe#seerbit-frame").style.display = "block";
        // document.querySelector("iframe#seerbit-framex").style.display = "block";
        document.getElementById("seerbit-loader").style.display = "block";
        // document.querySelector("iframe#seerbit-frame").style.display = "block";

        var agent = navigator.userAgent;
        // alert(agent);

        try {
          if (
            agent.indexOf("Apple") > -1 ||
            agent.indexOf("iPhone") > -1 ||
            agent.indexOf("Mac") > -1 ||
            agent.indexOf("iOS") > -1
          ) {
            handleTimeout = setInterval(function () {
              iframeWin.postMessage(
                JSON.parse(JSON.stringify(_.options)),
                _.url
              );
            }, 2000);

            handleTimeout = setInterval(function () {
              iframeWin.postMessage(JSON.stringify(_.options), _.url);
            }, 3000);

            handleTimeout = setInterval(function () {
              iframeWin.postMessage(_.options, _.url);
            }, 4000);
          } else if (
            agent.indexOf("Chrome") > -1 ||
            agent.indexOf("Firefox") > -1 ||
            agent.indexOf("OPR") > -1
          ) {
            // iframeWin.postMessage(JSON.parse(JSON.stringify(_.options)), _.url);
            handleTimeout = setInterval(function () {
              iframeWin.postMessage(
                JSON.parse(JSON.stringify(_.options)),
                _.url
              );
            }, 2000);
          } else {
            // alert(JSON.stringify(_.options));
            //   handleTimeout = setInterval(function () {
            //   iframeWin.postMessage(JSON.parse(JSON.stringify(_.options)), _.url);
            // }, 3000);
            handleTimeout = setInterval(function () {
              iframeWin.postMessage(
                JSON.parse(JSON.stringify(_.options)),
                _.url
              );
            }, 2000);
            // }
          }

          // iframeWin.postMessage(JSON.parse(JSON.stringify(_.options)), _.url);
          _.loaded = true;
        } catch (e) {
          alert("error initializing, please try again");
        }
      };
    }
    function seerbitReceiveMessage(message) {
      // console.log(message);

      if (message.data.type === "event") {
        seerbitEvents(message.data.message);
      }
      if (message.data === "received") {
        mess = true;
        clearInterval(handleTimeout);
        // alert("here");
        // document.querySelector("iframe#seerbit-frame").style.display = "";
        // document.querySelector("iframe#seerbit-frame").style.visibility =
        //   "hidden";
        // document.getElementById("seerbit-loader").style.display = "none";
        // _.background.style.visibility = "hidden";
        // _.background.style.visibility = "h";
      }

      if (message.data === "checkout_loaded") {
        // alert("here");
        // document.querySelector("iframe#seerbit-framex").style.display = "none";
        document.getElementById("seerbit-loader").style.display = "none";
        document.querySelector("iframe#seerbit-frame").style.visibility =
          "visible";
        document.querySelector("iframe#seerbit-frame").style.opacity = "1";
        document.querySelector("iframe#seerbit-frame").style.display = "block";
      }

      // if(message.data === 'isClose')

      if (message.data === "close") {
        if (_.close_prompt || _.close_prompt === undefined) {
          if (
            window.confirm(
              "You may not be able to continue this transaction later"
            )
          )
            seerbitGetClose();
        } else seerbitGetClose();
      } else if (message.data === "received") true;
      // _.background.style.visibility = "hidden";
      // document.getElementById("seerbit-loader").style.display = "none";
      else if (message.origin === url) seerbitGetCallback(message.data);
    }
    function removeElement(element) {
      element.parentNode.removeChild(element);
    }
    function seerbitGetClose() {
      document.querySelector("iframe#seerbit-frame").style.display = "none";
      document.querySelector("iframe#seerbit-framex").style.display = "none";
      // document.querySelector('iframe#seerbit-frame').remove()
      if (_.closeSB) _.closeSB("close");
    }

    function seerbitEvents(message) {
      if (_.events) _.events(message);
    }
    postMessage;
    function isClose() {
      // document.querySelector("iframe#seerbit-frame").src = this.config.url;
      document.querySelector("iframe#seerbit-frame").style.display = "none";
      document.querySelector("iframe#seerbit-framex").style.display = "none";
      // document.querySelector("iframe#seerbit-frame").src = this.config.url;
      // document.querySelector('iframe#seerbit-frame').remove()
    }

    function seerbitGetCallback(message) {
      // if (message.data.code === '00') {
      //     if (_.callback) {
      //         _.callback(message.data, isClose);
      //         _.getStatus && _.getStatus({ status: 'successful' });
      //     }
      // } else {
      //     if (_.getStatus) {
      //         _.getStatus && _.getStatus(message.data);
      //     }
      // }

      if (
        (_.callback && message && message.data && message.data.code === "00" && !_.close_on_success) ||
        /^((ftp|http|https):\/\/)|www\.?([a-zA-Z]+)\.([a-zA-Z]{2,})$/i.test(
          message.data
        )
      ) {
        _.callback(message.data, isClose);
      }

      if (
        message &&
        message.data &&
        (message.data.message === "Successful" ||
          message.data.message === "APPROVED" ||
          message.data.message === "Approved by Financial Institution") &&
        message.data.code === "00" &&
        /^((ftp|http|https):\/\/)|www\.?([a-zA-Z]+)\.([a-zA-Z]{2,})$/i.test(
          message.data.payments.callbackurl ||
          message.callbackurl ||
          message.data.callbackurl
        )
      ) {
        // alert('v2-test');
        setTimeout(function () {
          window.location.href =
            (message.data.callbackurl ||
              message.data.payments.callbackurl ||
              message.callbackurl) +
            "?linkingreference=" +
            (message.data.linkingreference ||
              message.data.payments.gatewayref ||
              message.data.payments.linkingreference) +
            "&code=" +
            message.data.code +
            "&message=" +
            message.data.message +
            "&reference=" +
            (message.data.reference ||
              message.data.payments.reference ||
              message.data.payments.paymentReference);
        }, 5000);
      }

      if (
        _.close_on_success &&
        message &&
        message.data &&
        message.data.code === "00" &&
        !/^((ftp|http|https):\/\/)|www\.?([a-zA-Z]+)\.([a-zA-Z]{2,})$/i.test(
          message.data.payments.callbackurl ||
          message.callbackurl ||
          message.data.callbackurl
        )
      ) {
        setTimeout(function () {
          _.callback && _.callback(message.data, isClose);
          isClose();
        }, 3000);
      }
    }
  };

  // Utility method to extend defaults with user options
  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }
})();
