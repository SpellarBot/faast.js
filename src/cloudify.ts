require("source-map-support").install();
import * as uuidv4 from "uuid/v4";
import * as aws from "./aws/aws-cloudify";
import * as google from "./google/google-cloudify";
import { log } from "./log";
import { PackerOptions, PackerResult } from "./packer";
import { FunctionCall, FunctionMetricsMap, FunctionReturn } from "./shared";
import { AnyFunction, Unpacked } from "./type-helpers";

export interface ResponseDetails<D> {
    value?: D;
    error?: Error;
    rawResponse: any;
    startLatency?: number;
    executionLatency?: number;
    returnLatency?: number;
}

export type Response<D> = ResponseDetails<Unpacked<D>>;

export type PromisifiedFunction<T extends AnyFunction> =
    // prettier-ignore
    T extends () => infer D ? () => Promise<Unpacked<D>> :
    T extends (a1: infer A1) => infer D ? (a1: A1) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2) => infer D ? (a1: A1, a2: A2) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3) => infer D ? (a1: A1, a2: A2, a3: A3) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7, a8: infer A8) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8) => Promise<Unpacked<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7, a8: infer A8, a9: infer A9) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, a9: A9) => Promise<Unpacked<D>> :
    T extends (...args: any[]) => infer D ? (...args: any[]) => Promise<Unpacked<D>> : T;

export type Promisified<M> = {
    [K in keyof M]: M[K] extends AnyFunction ? PromisifiedFunction<M[K]> : never
};

export type ResponsifiedFunction<T extends AnyFunction> =
    // prettier-ignore
    T extends () => infer D ? () => Promise<Response<D>> :
    T extends (a1: infer A1) => infer D ? (a1: A1) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2) => infer D ? (a1: A1, a2: A2) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3) => infer D ? (a1: A1, a2: A2, a3: A3) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7, a8: infer A8) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8) => Promise<Response<D>> :
    T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4, a5: infer A5, a6: infer A6, a7: infer A7, a8: infer A8, a9: infer A9) => infer D ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7, a8: A8, a9: A9) => Promise<Response<D>> :
    T extends (...args: any[]) => infer D ? (...args: any[]) => Promise<Response<D>> :T;

export type Responsified<M> = {
    [K in keyof M]: M[K] extends AnyFunction ? ResponsifiedFunction<M[K]> : never
};

export interface CommonOptions extends PackerOptions {
    timeout?: number;
    memorySize?: number;
    useQueue?: boolean;
}

function resolve(fmodule: string) {
    const parent = module.parent!;
    if (parent.filename.match(/aws-cloudify/)) {
        log(
            `WARNING: import cloudify before aws-cloudify to avoid problems with module resolution`
        );
    }
    log(`Cloudify module parent: %O`, (parent as any).filename);
    const moduleParentResolve = (parent.require as NodeRequire).resolve;
    return moduleParentResolve(fmodule);
}

export class Cloud<O extends CommonOptions, S> {
    name: string = this.impl.name;

    constructor(protected impl: CloudImpl<O, S>) {}

    cleanupResources(resources: string): Promise<void> {
        return this.impl.cleanupResources(resources);
    }

    pack(fmodule: string, options?: O): Promise<PackerResult> {
        return this.impl.pack(resolve(fmodule), options);
    }

    async createFunction(fmodule: string, options?: O): Promise<CloudFunction<S>> {
        return new CloudFunction(
            this.impl.getFunctionImpl(),
            await this.impl.initialize(resolve(fmodule), options)
        );
    }
}

export function processResponse(
    returned: FunctionReturn,
    callRequest: FunctionCall,
    metrics: FunctionMetricsMap
) {
    let error: Error | undefined;
    if (returned.type === "error") {
        const errValue = returned.value;
        error = new Error(errValue.message);
        error.name = errValue.name;
        error.stack = errValue.stack;
    }
    const value = !error && returned.value;
    let rv: Response<ReturnType<any>> = {
        value,
        error,
        rawResponse: returned.rawResponse
    };
    const fn = callRequest.name;
    metrics.increment(fn, "completed");
    if (returned.executionStart && returned.executionEnd) {
        const latencies = {
            executionLatency: returned.executionEnd - returned.executionStart,
            startLatency: returned.executionStart - callRequest.start,
            returnLatency: Date.now() - returned.executionEnd
        };
        rv = { ...rv, ...latencies };
        metrics.updateMany(fn, latencies);
    }
    if (error) {
        metrics.increment(fn, "errors");
    }
    return rv;
}

export class CloudFunction<S> {
    cloudName = this.impl.name;
    timer?: NodeJS.Timer;
    functionMetrics = new FunctionMetricsMap();

    constructor(protected impl: CloudFunctionImpl<S>, readonly state: S) {}

    cleanup() {
        this.stopPrintStatisticsInterval();
        return this.impl.cleanup(this.state);
    }

    stop() {
        return this.impl.stop(this.state);
    }

    getResourceList() {
        return this.impl.getResourceList(this.state);
    }

    getState() {
        return this.state;
    }

    printStatisticsInterval(interval: number) {
        this.functionMetrics.logInterval(interval);
    }

    stopPrintStatisticsInterval() {
        this.functionMetrics.stopLogInterval();
    }

    setConcurrency(maxConcurrentExecutions: number): Promise<void> {
        return this.impl.setConcurrency(this.state, maxConcurrentExecutions);
    }

    cloudifyWithResponse<F extends AnyFunction>(fn: F) {
        const responsifedFunc = async (...args: any[]) => {
            const CallId = uuidv4();
            const start = Date.now();
            const callRequest: FunctionCall = { name: fn.name, args, CallId, start };
            const rv = await this.impl
                .callFunction(this.state, callRequest)
                .catch(value => {
                    const err: FunctionReturn = {
                        type: "error",
                        value,
                        CallId,
                        executionStart: start,
                        executionEnd: Date.now()
                    };
                    return err;
                });
            return processResponse(rv, callRequest, this.functionMetrics);
        };
        return responsifedFunc as any;
    }

    cloudify<F extends AnyFunction>(fn: F): PromisifiedFunction<F> {
        const cloudifiedFunc = async (...args: any[]) => {
            const cfn = this.cloudifyWithResponse<F>(fn) as any;
            const response: Response<ReturnType<F>> = await cfn(...args);
            if (response.error) {
                throw response.error;
            }
            return response.value;
        };
        return cloudifiedFunc as any;
    }

    cloudifyAll<M>(module: M): Promisified<M> {
        const rv: any = {};
        for (const name of Object.keys(module)) {
            if (typeof module[name] === "function") {
                rv[name] = this.cloudify(module[name]);
            }
        }
        return rv;
    }

    cloudifyAllWithResponse<M>(module: M): Responsified<M> {
        const rv: any = {};
        for (const name of Object.keys(module)) {
            if (typeof module[name] === "function") {
                rv[name] = this.cloudifyWithResponse(module[name]);
            }
        }
        return rv;
    }
}

export class AWS extends Cloud<aws.Options, aws.State> {
    constructor() {
        super(aws.Impl);
    }
}

export class AWSLambda extends CloudFunction<aws.State> {}

export class Google extends Cloud<google.Options, google.State> {
    constructor() {
        super(google.Impl);
    }
}

export class GoogleEmulator extends Cloud<google.Options, google.State> {
    constructor() {
        super(google.EmulatorImpl);
    }
}

export class GoogleCloudFunction extends CloudFunction<google.State> {}

export type CloudProvider = "aws" | "google" | "google-emulator";

export function create(cloudName: "aws"): AWS;
export function create(cloudName: "google"): Google;
export function create(cloudName: "google-emulator"): GoogleEmulator;
export function create(cloudName: CloudProvider): Cloud<any, any>;
export function create(cloudName: CloudProvider): Cloud<any, any> {
    if (cloudName === "aws") {
        return new AWS();
    } else if (cloudName === "google") {
        return new Google();
    } else if (cloudName === "google-emulator") {
        return new GoogleEmulator();
    }
    throw new Error(`Unknown cloud name: "${cloudName}"`);
}

export interface CloudImpl<O, S> {
    name: string;
    initialize(serverModule: string, options?: O): Promise<S>;
    cleanupResources(resources: string): Promise<void>;
    pack(functionModule: string, options?: O): Promise<PackerResult>;
    getFunctionImpl(): CloudFunctionImpl<S>;
}

export interface CloudFunctionImpl<State> {
    name: string;
    callFunction(state: State, call: FunctionCall): Promise<FunctionReturn>;
    cleanup(state: State): Promise<void>;
    stop(state: State): Promise<void>;
    getResourceList(state: State): string;
    setConcurrency(state: State, maxConcurrentExecutions: number): Promise<void>;
}
