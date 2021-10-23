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
const colorRegex: RegExp = /^([#](?:[0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})|rgba?\( *[0-9]{1,3}(?: *, *[0-9]{1,3}){2}(?: *, *(?:0?[.][0-9]{1,5}|[01]))? *\)|hsla?\( *[0-9]{1,3}(?: *, *[0-9]{1,3}%){2}(?: *, *(?:0?[.][0-9]{1,5}|[01]))? *\))$/g;

export function validateColor(color: string) {
    // TODO: Pre-defined colours
    if (!colorRegex.test(color))
        return "Invalid syntax";
}