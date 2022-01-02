"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QixingError = void 0;
class QixingError extends Error {
    constructor(name, message) {
        super(message);
        this.name = name;
    }
}
exports.QixingError = QixingError;
