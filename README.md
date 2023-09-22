# DQL JavaScript library

[<img src="https://img.shields.io/npm/v/@dqljs/string-builder.svg?style=flat"/>](https://npmjs.org/package/@dqljs/string-builder)
[<img src="https://img.shields.io/github/license/fzoli/dql-kotlin"/>](https://github.com/fzoli/dql-kotlin/blob/main/LICENSE)

This is the client-side implementation of DQL for TypeScript.

## Example

[Type definition](https://github.com/fzoli/dql-ts/blob/main/sample/src/usage.model.ts)

[Usage](https://github.com/fzoli/dql-ts/blob/main/sample/src/usage.test.ts)

## Language design

In the example provided, the filter expression can be conveniently sent as a `GET` query parameter through a REST API.
However, it may be worthwhile to provide a `POST` endpoint for cases where the filtering criteria are long and exceed the `GET` limit.

The example also demonstrates how the expression serializes into a DQL expression.
The DQL language supports only text and numbers as values; nothing else. It will become clear later why.

There are two types of filter conditions:
- Standalone meaningful conditions (e.g., `isNull`, `isTrue`)
- Conditions meaningful only with values (e.g., `startsWith`)

The language recognizes three operators (from which any other complex expressions can be derived):
- and
- or
- not

`Not` can be applied to grouped conditions (e.g., `!(a|b)`) or standalone conditions (e.g., `!a`).
`And` and `or` can only appear between two conditions (both conditions can be grouped or standalone, e.g., `a&b`, `a&(b|c)`).

Operator precedence matters when interpreting complex conditions.
`And` is a higher-order operation than `or`. 
So, `a&b|c` = `((a&b)|c)`, `a|b&c` = `(a|(b&c))`.
The serializer does not include unnecessary parentheses in the expression.

Every condition starts with a field name, followed by a filter method. The filter method is separated from the field name by a colon (e.g., `name:isEmpty`). The field name can also contain dots, which conventionally represent embedded objects (e.g., `person.name:isEmpty`). The field name can contain underscores if someone prefers `snake_case` over `camelCase`. 
The field name can include numbers, but for technical reasons, the first character cannot be a number, even though DQL allows it, most programming languages do not support it.

There cannot be a colon in the method. If a value follows the method, it is separated from the method by a colon (e.g., `name:startsWith:"Hello"`).

There's no such thing as `enabled:eq:true`; it should be written as `enabled:isTrue`. Thus, there is no need to support the boolean values `true` and `false` explicitly.

The numeric type can be an integer or a decimal. 
The decimal separator is a dot (e.g., `0.1`).

Values can also be represented as enumerations. The beginning of an enumeration is marked by `[` and the end by `]`.
Values are separated by commas (e.g., `name:memberOf:["a","b"]`).

String values must be enclosed in double quotation marks. (The `'` character is not supported.)
If a string contains a `"` character, a `\` character should precede it. 
For example, `"Quoting: \"Long live the king!\""` is represented as:
*Quoting: "Long live the king!"*

Whitespace characters are not supported in the language, and there is no thousands grouping in numbers.

So, `name : eq : "oh my me" | active:isTrue` is incorrect for two reasons:
- There cannot be spaces between the field name and the method, or between the method and the value.
- There cannot be spaces before or after operators.
- ("oh my me" is itself a string value and can contain spaces.)

Field name indexing is not supported (e.g., `numbers[1]:eq:6`). The main reason for this is that values are unordered during filtering (treated as sets), so although it could be expressed in the language, it wouldn't be useful.

That's the entire language.

Oh, wait... there's one more easter egg in the language, but I won't really advertise it.

You might have noticed that I only used constant expressions after the method. This is because we primarily filter on exact values, and even if a value is derived from a complex client-side condition, it's entirely unnecessary to send it to the backend and calculate it. That's why there are no operations in the language, like string concatenation or number addition.

However, there can be backend-defined constants that would be useful as filter condition values on the client side. Currently, this is possible in a limited way.
A template variable is substituted by the backend-side parser based on context (if it's not understood, it throws an error). For example, `name:eq:{currentUser.name}`

I say it's limited because there might be cases where you'd want to add, say, *five* to a numeric template expression. The language doesn't support this, so I'm not really advertising this feature.
I haven't implemented it for fun, as it would also require defining operations.
It would be a shame to complicate this elegantly simple language for this reason until it's necessary.

Other data types at the language level could be considered, such as enums or dates. These can be represented as text or numbers, so nope.

Type safety comes from the API. Each field has a type that determines which filter methods are available for it, and if a method also has a value, its type is strictly defined.
For example, for a `NumberField`, the `eq` and `gt` methods only accept numbers, while for a `StringField`, `eq` only accepts strings, and `gt` is not defined, but `startsWith` is available.

For an `EnumField`, `eq` only accepts values from the enum type and nothing else.
In the language, enums are represented as strings, so for now, only string enums are supported in TypeScript.

Date-time values are represented as strings in ISO 8601 format in UTC time zone.
With UTC, all past times work correctly, and future times only shift within a region if a country changes its time zone after storing a future time. Because we converted the local time pointing to the future according to the old rule to UTC. It's a really rare edge case... there are better things to do.
One more thing to note is that the backend supports leap seconds but not by representing the 60th second (referring to 23:59:60), but by using UTC-SLS.
(The UTC-SLS means that on days with an extra second, the last thousand seconds run 0.1% slower. On days when the last second is removed, they run 0.1% faster. This smooths out the extra second, so there's no 60th second. As a result, the parser replaces the 60th second with the 59th second.)

Whole numbers/decimals that require exact precision should be represented as strings. This includes any number that doesn't fit into the platform's number data type. In JavaScript, this is the `number`; in Java, it could be `Int`, `Long`, `Double`, or `Float`. For Java, there's also the `BigDecimalField` for high-precision exact values.

The type safety is strong enough that, for example, a `LongField` won't accept an `Int` value, even in the `eq` method. Similarly, only `Long` values can be used in the `memberOf` enumeration.

The filter expression value cannot be `null`, so the expression `name:eq:null` is not valid. Instead, you should use `name:isNull`.
`Null` values are also not allowed in enumerations. `Null` includes the `undefined` value if the target is JavaScript (for me, these two are equivalent).

On the server side, these `Field` implementations are available for several SDKs. One of them is `QueryDSL`, which can run `JPA` and native `JDBC` SQL queries.
Naturally, the filter expression goes into the `where` clause.

`ElasticSearch` is also supported.
In-memory support exists mostly for fake implementations and testing.
Of course, client-side mode is also supported, just like in TypeScript.
