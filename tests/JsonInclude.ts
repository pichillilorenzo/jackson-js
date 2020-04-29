import test from 'ava';
import {JsonInclude, JsonIncludeType} from '../src/decorators/JsonInclude';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonClassType} from '../src/decorators/JsonClassType';

test('@JsonInclude at class level with JsonIncludeType.NON_EMPTY', t => {
  @JsonInclude({value: JsonIncludeType.NON_EMPTY})
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John"}'));
});

test('@JsonInclude at class level with JsonIncludeType.NON_NULL', t => {
  @JsonInclude({value: JsonIncludeType.NON_NULL})
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","dept":"","phones":[],"otherInfo":{}}'));
});

test('@JsonInclude at class level with JsonIncludeType.NON_DEFAULT', t => {
  @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"John"}'));
});

test('@JsonInclude at class level with JsonIncludeType.ALWAYS', t => {
  @JsonInclude({value: JsonIncludeType.ALWAYS})
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","dept":"","address":null,"phones":[],"otherInfo":{}}'));
});

test('@JsonInclude at class level with JsonIncludeType.CUSTOM value filter', t => {
  @JsonInclude({value: JsonIncludeType.CUSTOM, valueFilter: (value: any) => value == null || value === ''})
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","phones":[],"otherInfo":{}}'));
});

test('@JsonInclude at method level with JsonIncludeType.NON_EMPTY', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }

    @JsonGetter() @JsonClassType({type: () => [Number]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    getId(): number {
      return this.id;
    }
    @JsonGetter() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    getName(): string {
      return this.name;
    }
    @JsonGetter() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    getDept(): string {
      return this.dept;
    }
    @JsonGetter() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    getAddress(): string {
      return this.address;
    }
    @JsonGetter() @JsonClassType({type: () => [Array, [String]]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    getPhones(): string[] {
      return this.phones;
    }
    @JsonGetter() @JsonClassType({type: () => [Map, [String, String]]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    getOtherInfo(): Map<string, string> {
      return this.otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John"}'));
});

test('@JsonInclude at property level with JsonIncludeType.NON_EMPTY', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John"}'));
});

test('@JsonInclude at property level with JsonIncludeType.NON_NULL', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","dept":"","phones":[],"otherInfo":{}}'));
});

test('@JsonInclude at property level with JsonIncludeType.NON_DEFAULT', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"name":"John"}'));
});

test('@JsonInclude at property level with JsonIncludeType.ALWAYS', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    dept: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    address: string;
    @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    phones: string[];
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    otherInfo: Map<string, string>;

    constructor(id: number, name: string, dept: string, address: string, phones: string[], otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.dept = dept;
      this.address = address;
      this.phones = phones;
      this.otherInfo = otherInfo;
    }
  }

  const employee = new Employee(0, 'John', '', null, [], new Map<string, string>());
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","dept":"","address":null,"phones":[],"otherInfo":{}}'));
});

test('@JsonInclude on Map property with value JsonIncludeType.NON_EMPTY and content JsonIncludeType.NON_NULL', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY, content: JsonIncludeType.NON_NULL})
    otherInfo: Map<string, string>;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.otherInfo = otherInfo;
    }
  }

  const otherInfo = new Map<string, string>();
  otherInfo.set('phone', null);
  otherInfo.set('address', '123 Main Street, New York, NY 10030');

  const employee = new Employee(0, 'John', otherInfo);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","otherInfo":{"address":"123 Main Street, New York, NY 10030"}}'));
});

test('@JsonInclude on "Object Literal" property with value JsonIncludeType.NON_EMPTY and content JsonIncludeType.NON_NULL', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [Object, [String, String]]})
    @JsonInclude({value: JsonIncludeType.NON_EMPTY, content: JsonIncludeType.NON_NULL})
    otherInfo: Record<string, string>;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, otherInfo: Record<string, string>) {
      this.id = id;
      this.name = name;
      this.otherInfo = otherInfo;
    }
  }

  const otherInfo = {
    phone: null,
    address: '123 Main Street, New York, NY 10030'
  };
  const employee = new Employee(0, 'John', otherInfo);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","otherInfo":{"address":"123 Main Street, New York, NY 10030"}}'));
});

test('@JsonInclude on Map property with value JsonIncludeType.NON_EMPTY and JsonIncludeType.CUSTOM content filter', t => {
  class Employee {
    @JsonProperty() @JsonClassType({type: () => [Number]})
    id: number;
    @JsonProperty() @JsonClassType({type: () => [String]})
    name: string;
    @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
    @JsonInclude({
      value: JsonIncludeType.NON_EMPTY,
      content: JsonIncludeType.CUSTOM,
      contentFilter: (contentValue: any) => contentValue == null
    })
    otherInfo: Map<string, string>;

    // eslint-disable-next-line no-shadow
    constructor(id: number, name: string, otherInfo: Map<string, string>) {
      this.id = id;
      this.name = name;
      this.otherInfo = otherInfo;
    }
  }

  const otherInfo = new Map<string, string>();
  otherInfo.set('phone', null);
  otherInfo.set('address', '123 Main Street, New York, NY 10030');

  const employee = new Employee(0, 'John', otherInfo);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":0,"name":"John","otherInfo":{"address":"123 Main Street, New York, NY 10030"}}'));
});
