import { AxeResults, Result, RunOnly } from "axe-core";

/**
 * Version of the aXe verifier with defaults set.
 * 
 * @remarks You can still pass additional options to this new instance;
 *          they will be merged with the defaults.
 */
export const axe: JestAxe;

/**
 * Core options to run aXe.
 */
export interface AxeOptions {
    runOnly?: RunOnly;
    rules?: object;
    iframes?: boolean;
    elementRef?: boolean;
    selectors?: boolean;
}

/**
 * Runs aXe on HTML.
 * 
 * @param html   Raw HTML string to verify with aXe.
 * @param options   Options to run aXe.
 * @returns Promise for the results of running aXe.
 */
export type JestAxe = (html: string, options?: AxeOptions) => Promise<AxeResults>;

/**
 * Creates a new aXe verifier function.
 * 
 * @param options   Options to run aXe.
 * @returns New aXe verifier function.
 */
export const configureAxe: (options: AxeOptions) => JestAxe;

export interface AssertionsResult {
    actual: Result[];
    message(): string;
    pass: boolean;
}

/**
 * Asserts an aXe-verified result has no violations.
 *
 * @param results   aXe verification result, if not running via expect().
 * @returns Jest expectations for the aXe result.
 */
export type IToHaveNoViolations = (results?: Partial<AxeResults>) => AssertionsResult;

export const toHaveNoViolations: {
    toHaveNoViolations: IToHaveNoViolations;
};

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveNoViolations: IToHaveNoViolations;
        }
    }
}
