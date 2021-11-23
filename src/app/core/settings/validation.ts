// @ts-ignore
const { inputFieldValidations: { validateIsUrl } }: { inputFieldValidations: { validateIsUrl: (raw: string) => undefined | string } } = ReGuildedApi;

export default {
    /**
     * Valid:
     * #AAA
     * #AAAA
     * #AAAAAA
     * #AAAAAAAA
     * 
     * rgb(123, 123, 123)
     * rgba(123, 123, 123)
     * rgb(123, 123, 123, 0.123)
     * rgba(123, 123, 123, .123)
     * rgba( 123 , 123 , 123 , 1 )
     * rgba(123, 123, 123, 0)
     * hsl(123, 100%, 100%)
     * hsla(123, 100%, 100%, 0.3)
     * 
     * Invalid:
     * #AAAAA
     * #AAAAAAA
     * 
     * rgba(123, 123, 123, 1.2)
     * rgb(1233, 123, 123)
     */
    // TODO: Pre-defined colours
    color: validationFactory(
        /^([#](?:[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})|rgba?\( *[0-9]{1,3}(?: *, *[0-9]{1,3}){2}(?: *, *(?:0?[.][0-9]{1,5}|[01]))? *\)|hsla?\( *[0-9]{1,3}(?: *, *[0-9]{1,3}%){2}(?: *, *(?:0?[.][0-9]{1,5}|[01]))? *\))$/
    ),
    size: validationFactory(
        /^(0|(?:[0-9]{1,2}(?:\.[0-9]+)?|\.[0-9]+)\%|(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:px|em|rem|vh|vw|ex|ch|vmin|vmax|cm|mm|in|pt|pc))$/
    ),
    percent: validationFactory(/^([01]|0?\.[0-9]+|(?:100|[0-9]{1,2}(?:\.[0-9]+)|\.[0-9]+)\%)$/),
    // Guilded validators
    url: validateIsUrl
}

function validationFactory(regex: RegExp) {
    // Validator
    return function validate(raw: string): undefined | string {
        if (!regex.test(raw)) return "Invalid syntax";
    }
}