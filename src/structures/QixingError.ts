export class QixingError extends Error {
    constructor(name: string, message: string) {
        super(message)
        this.name = `QixingError [${name}]`
    }
}
