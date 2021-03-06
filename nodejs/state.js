/**
 * Copyright 2018 F5 Networks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const MASK_REGEX = require('./sharedConstants').MASK_REGEX;

/**
 * Represents the declarative onboarding state
 *
 * @class
 */
class State {
    /**
     * Copy constructor
     *
     * This allows us to re-create a state object with methods from just the data
     *
     * @param {Object} existingState - The existing state data
     */
    constructor(existingState) {
        this.result = {};
        this.internalDeclaration = {};

        if (existingState) {
            Object.assign(this.result, existingState.result);
            Object.assign(this.internalDeclaration, existingState.internalDeclaration);

            if (existingState.currentConfig) {
                this.currentConfig = {};
                Object.assign(this.currentConfig, existingState.currentConfig);
            }

            if (existingState.originalConfig) {
                this.originalConfig = {};
                Object.assign(this.originalConfig, existingState.originalConfig);
            }
        }
    }

    /**
     * Sets the current result code
     */
    set code(code) {
        this.result.code = code;
    }

    /**
     * Gets the current result code
     */
    get code() {
        return this.result.code;
    }

    /**
     * Sets the current result message
     */
    set message(message) {
        this.result.message = message;
    }

    /**
     * Gets the current result message
     */
    get message() {
        return this.result.message;
    }

    /**
     * Sets the current status string
     */
    set status(status) {
        this.result.status = status;
    }

    /**
     * Gets the current status string
     */
    get status() {
        return this.result.status;
    }

    /**
     * Sets the current errors
     *
     * @param {String[]} errors - The error array to set
     */
    set errors(errors) {
        if (errors) {
            this.result.errors = errors.slice();
        } else if (this.result.errors) {
            this.result.errors.length = 0;
        }
    }

    /**
     * Gets the current result message
     */
    get errors() {
        return this.result.errors;
    }

    /**
     * Sets the declaration masking certain values
     *
     * @param {Object} declaration - The declaration to set.
     */
    set declaration(declaration) {
        this.internalDeclaration = mask(declaration);
    }

    /**
     * Gets the declaration
     */
    get declaration() {
        return this.internalDeclaration;
    }

    /**
     * Updates the result
     *
     * @param {number} code - The f5-declarative-onboarding result code.
     * @param {string} status - The f5-declarative-onboarding status string from sharedConstants.STATUS.
     * @param {string} message - The user friendly error message if there is one.
     * @param {string | array} - An error message or array of messages
     */
    updateResult(code, status, message, errors) {
        if (code) {
            this.result.code = code;
        }

        if (status) {
            this.result.status = status;
        }

        if (message) {
            this.result.message = message;
        }

        if (errors) {
            if (!this.result.errors) {
                this.result.errors = [];
            }

            if (Array.isArray(errors)) {
                this.result.errors = this.result.errors.concat(errors);
            } else {
                this.result.errors.push(errors);
            }
        }
    }
}

function mask(declaration) {
    const masked = JSON.parse(JSON.stringify(declaration));

    Object.keys(masked).forEach((key) => {
        if (!Array.isArray(masked[key]) && typeof masked[key] === 'object') {
            masked[key] = mask(masked[key]);
        } else if (Array.isArray(masked[key])) {
            masked[key].forEach((item, index) => {
                if (!Array.isArray(item) && typeof item === 'object') {
                    masked[key][index] = mask(item);
                }
            });
        } else if (MASK_REGEX.test(key)) {
            delete masked[key];
        }
    });

    return masked;
}

module.exports = State;
