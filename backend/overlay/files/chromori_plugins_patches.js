(() => {
    const style = document.createElement("style");
    style.innerHTML = `.chromori_achievement_area {
        z-index: 9999;
        user-select: none;
        position: absolute;
        bottom: 0;
        right: 0;
        overflow-y: hidden;
    }

    .chromori_achievement {
        width: 283px;
        height: 70px;
        animation: 5s linear 0s 1 slideInFromBottom;
        background: linear-gradient(#23262e, #0e141b);
    }

    .chromori_achievement_text {
        display: flex;
        height: 100%;
        flex-direction: column;
        justify-content: center;
    }

    .chromori_achievement_text>div {
        font-size: 12px;
        font-family: Helvetica;
    }

    .chromori_achievement_name {
        color: #ededee;
    }

    .chromori_achievement_desc {
        color: #646b72;
    }

    @keyframes slideInFromBottom {
        0% {
            transform: translateY(100%);
        }

        5% {
            transform: translateY(0%);
        }

        95% {
            transform: translateY(0%);
        }

        100% {
            transform: translateY(100%);
        }
    }

    .chromori_achievement_icon {
        width: 44px;
        height: 44px;
        float: left;
        margin: 13px 16px 13px 10px;
        background-image: url('https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/1150690/4e50f8a9ce8a4f412042165032dfdd54a4f931f2.jpg');
        background-size: cover;
    }`;
    document.head.appendChild(style);

    const area = document.createElement("div");
    area.className = "chromori_achievement_area";
    document.body.appendChild(area);

    Window_OmoMenuOptionsGeneral = class extends Window_OmoMenuOptionsGeneral {
        // remove resolution and fullscreen options
        makeOptionsList() {
            super.makeOptionsList(...arguments);
            this._optionsList = this._optionsList.slice(2);
        }

        // skip resolution and fullscreen options when changing options
        processOptionCommand() {
            const _index = this.index;
            this.index = function () {
                return _index.call(this, ...arguments) + 2;
            };

            this._optionsList.unshift(null, null);
            super.processOptionCommand(...arguments);
            this._optionsList = this._optionsList.slice(2);

            this.index = _index;
        }
    };

    Window_OmoMenuOptionsSystem = class extends Window_OmoMenuOptionsSystem {
        // remove exit option
        makeCommandList() {
            const _addCommand = this.addCommand;
            this.addCommand = function (_, symbol) {
                if (symbol !== "exit") _addCommand.call(this, ...arguments);
            };
            super.makeCommandList(...arguments);
            this.addCommand = _addCommand;
        }
    };
})();
