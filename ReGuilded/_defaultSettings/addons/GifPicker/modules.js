let React, ReactDOM;

module.exports = {
    init: _ => {
        React = _._webpackExportList.find(m => typeof(m.exports.createElement) === "function").exports;
        ReactDOM = _._webpackExportList.find(m => typeof(m.exports.unmountComponentAtNode) === "function").exports;
    },
    get React() { return React; },
    get ReactDOM() { return ReactDOM; }
}