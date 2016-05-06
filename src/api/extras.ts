import {IDepTreeNode} from "../core/observable";
import {unique, Lambda, deprecated, once} from "../utils/utils";
import {globalState} from "../core/globalstate";

export interface IDependencyTree {
	id: number;
	name: string;
	dependencies?: IDependencyTree[];
}

export interface IObserverTree {
	id: number;
	name: string;
	observers?: IObserverTree[];
}

export function allowStateChanges<T>(allowStateChanges: boolean, func: () => T): T {
	const prev = globalState.allowStateChanges;
	globalState.allowStateChanges = allowStateChanges;
	const res = func();
	globalState.allowStateChanges = prev;
	return res;
}

export function getDependencyTree(thing: any): IDependencyTree {
	return nodeToDependencyTree(thing);
}

function nodeToDependencyTree(node: IDepTreeNode): IDependencyTree {
	const result: IDependencyTree = {
		id: node.id,
		name: `${node.name}@${node.id}`
	};
	if (node.observing && node.observing.length)
		result.dependencies = unique(node.observing).map(nodeToDependencyTree);
	return result;
}

export function getObserverTree(thing: any): IObserverTree {
	return nodeToObserverTree(thing);
}

function nodeToObserverTree(node: IDepTreeNode): IObserverTree {
	const result: IObserverTree = {
		id: node.id,
		name: `${node.name}@${node.id}`
	};
	if (node.observers && node.observers.length)
		result.observers = <any>unique(node.observers).map(<any>nodeToObserverTree);
	return result;
}

export function trackTransitions(onReport?: (c) => void): Lambda {
	if (typeof onReport === "boolean") {
		deprecated("trackTransitions only takes a single callback function. If you are using the mobx-react-devtools, please update them first");
		onReport = arguments[1];
	}
	if (!onReport) {
		deprecated("trackTransitions without callback has been deprecated and is a no-op now. If you are using the mobx-react-devtools, please update them first");
		return () => {};
	}
	globalState.spyListeners.push(onReport);
	return once(() => {
		const idx = globalState.spyListeners.indexOf(onReport);
		if (idx !== -1)
			globalState.spyListeners.splice(idx, 1);
	});
}