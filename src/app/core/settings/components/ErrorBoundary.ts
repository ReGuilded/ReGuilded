import _React from "react";

const { React }: { React: { Component: typeof _React.Component } } = window.ReGuildedApi;

export default class ErrorBoundary extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    componentDidCatch(error) {
        console.error(error);
        console.warn('Catched error in', this.props.children)
    }
    render() {
        return this.props.children;
    }
}