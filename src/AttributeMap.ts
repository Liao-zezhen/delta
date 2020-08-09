import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';

interface AttributeMap {
  [key: string]: any;
}

/**
 * 所有匹配都不会保留值为undefined的属性。
 */
namespace AttributeMap {
  /**
   * B从A中拷贝值，如果B存在该属性的话，则不需要进行拷贝。
   *
   * 保留A和B所有属性，保留下来的属性的值以b为主，否则以a为主。
   * 如果keepNull为false的话，那么从保留下来的属性中，排除掉在B中值为null的属性。
   */
  export function compose(
    a: AttributeMap = {},
    b: AttributeMap = {},
    keepNull: boolean,
  ): AttributeMap | undefined {
    if (typeof a !== 'object') {
      a = {};
    }
    if (typeof b !== 'object') {
      b = {};
    }
    let attributes = cloneDeep(b);

    // 是否排除B中带Null的值。
    if (!keepNull) {
      attributes = Object.keys(attributes).reduce<AttributeMap>((copy, key) => {
        if (attributes[key] != null) {
          copy[key] = attributes[key];
        }
        return copy;
      }, {});
    }
    for (const key in a) {
      // B从A中拷贝值，如果B存在该属性的话，则不需要进行拷贝。
      if (a[key] !== undefined && b[key] === undefined) {
        attributes[key] = a[key];
      }
    }
    return Object.keys(attributes).length > 0 ? attributes : undefined;
  }

  /**
   * 从A和B中找出值不相同的数据，B指定属性的值不存在的话，默认为null。
   *
   * 保留A和B所有值不相同的属性，保留下来的属性的值以b为主，否则设置为null
   */
  export function diff(
    a: AttributeMap = {},
    b: AttributeMap = {},
  ): AttributeMap | undefined {
    if (typeof a !== 'object') {
      a = {};
    }
    if (typeof b !== 'object') {
      b = {};
    }
    const attributes = Object.keys(a)
      .concat(Object.keys(b))
      .reduce<AttributeMap>((attrs, key) => {
        // 如果A和B指定属性的值不相等的话，进行赋值。
        // 如果B指定属性不存在的话，默认值为null。
        if (!isEqual(a[key], b[key])) {
          attrs[key] = b[key] === undefined ? null : b[key];
        }
        return attrs;
      }, {});
    return Object.keys(attributes).length > 0 ? attributes : undefined;
  }

  /**
   * 保留base和attr存在相同属性但值不相同的属性，值设置为base属性的值；
   * 保留attr存在但base不存在的属性，值设置为null。
   *
   * 保留attr的所有存在值的属性，保留下来的属性的值以base为主，否则设置为null。
   * 如果attr和base存在值相同的属性，则不保留。
   */
  export function invert(
    attr: AttributeMap = {},
    base: AttributeMap = {},
  ): AttributeMap {
    attr = attr || {};
    // 从base获取attr存在但值不相同的属性，并保留base指定属性的值；
    const baseInverted = Object.keys(base).reduce<AttributeMap>((memo, key) => {
      if (base[key] !== attr[key] && attr[key] !== undefined) {
        memo[key] = base[key];
      }
      return memo;
    }, {});

    // 从attr获取base没有的属性，并且值设置为null。
    return Object.keys(attr).reduce<AttributeMap>((memo, key) => {
      if (attr[key] !== base[key] && base[key] === undefined) {
        memo[key] = null;
      }
      return memo;
    }, baseInverted);
  }

  /**
   * 如果设置priority为true的话，那么从b中获取a没有的属性；false的话，则返回b。
   */
  export function transform(
    a: AttributeMap | undefined,
    b: AttributeMap | undefined,
    priority = false,
  ): AttributeMap | undefined {
    if (typeof a !== 'object') {
      return b;
    }
    if (typeof b !== 'object') {
      return undefined;
    }
    if (!priority) {
      return b; // b simply overwrites us without priority
    }
    const attributes = Object.keys(b).reduce<AttributeMap>((attrs, key) => {
      if (a[key] === undefined) {
        attrs[key] = b[key]; // null is a valid value
      }
      return attrs;
    }, {});
    return Object.keys(attributes).length > 0 ? attributes : undefined;
  }
}

export default AttributeMap;
