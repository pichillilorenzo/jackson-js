import test from 'ava';
import {JsonInclude, JsonIncludeType, ObjectMapper} from '../src';

test('@JsonInclude on class with JsonIncludeType.NON_EMPTY', t => {
  @JsonInclude({value: JsonIncludeType.NON_EMPTY})
  class Employee {
    id: number;
    name: string;
    dept: string;
    address: string;
    phones: string[];
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
  t.assert(jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(!jsonData.includes('dept'));
  t.assert(!jsonData.includes('address'));
  t.assert(!jsonData.includes('phones'));
  t.assert(!jsonData.includes('otherInfo'));
});

test('@JsonInclude on class with JsonIncludeType.NON_NULL', t => {
  @JsonInclude({value: JsonIncludeType.NON_NULL})
  class Employee {
    id: number;
    name: string;
    dept: string;
    address: string;
    phones: string[];
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
  t.assert(jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(jsonData.includes('dept'));
  t.assert(!jsonData.includes('address'));
  t.assert(jsonData.includes('phones'));
  t.assert(jsonData.includes('otherInfo'));
});

test('@JsonInclude on class with JsonIncludeType.NON_DEFAULT', t => {
  @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
  class Employee {
    id: number;
    name: string;
    dept: string;
    address: string;
    phones: string[];
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
  t.assert(!jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(!jsonData.includes('dept'));
  t.assert(!jsonData.includes('address'));
  t.assert(!jsonData.includes('phones'));
  t.assert(!jsonData.includes('otherInfo'));
});

test('@JsonInclude on class with JsonIncludeType.ALWAYS', t => {
  @JsonInclude({value: JsonIncludeType.ALWAYS})
  class Employee {
    id: number;
    name: string;
    dept: string;
    address: string;
    phones: string[];
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
  t.assert(jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(jsonData.includes('dept'));
  t.assert(jsonData.includes('address'));
  t.assert(jsonData.includes('phones'));
  t.assert(jsonData.includes('otherInfo'));
});

test('@JsonInclude on property with JsonIncludeType.NON_EMPTY', t => {
  class Employee {
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    id: number;
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    name: string;
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    dept: string;
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    address: string;
    @JsonInclude({value: JsonIncludeType.NON_EMPTY})
    phones: string[];
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
  t.assert(jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(!jsonData.includes('dept'));
  t.assert(!jsonData.includes('address'));
  t.assert(!jsonData.includes('phones'));
  t.assert(!jsonData.includes('otherInfo'));
});

test('@JsonInclude on property with JsonIncludeType.NON_NULL', t => {
  class Employee {
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    id: number;
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    name: string;
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    dept: string;
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    address: string;
    @JsonInclude({value: JsonIncludeType.NON_NULL})
    phones: string[];
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
  t.assert(jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(jsonData.includes('dept'));
  t.assert(!jsonData.includes('address'));
  t.assert(jsonData.includes('phones'));
  t.assert(jsonData.includes('otherInfo'));
});

test('@JsonInclude on property with JsonIncludeType.NON_DEFAULT', t => {
  class Employee {
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    id: number;
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    name: string;
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    dept: string;
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    address: string;
    @JsonInclude({value: JsonIncludeType.NON_DEFAULT})
    phones: string[];
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
  t.assert(!jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(!jsonData.includes('dept'));
  t.assert(!jsonData.includes('address'));
  t.assert(!jsonData.includes('phones'));
  t.assert(!jsonData.includes('otherInfo'));
});

test('@JsonInclude on property with JsonIncludeType.ALWAYS', t => {
  class Employee {
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    id: number;
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    name: string;
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    dept: string;
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    address: string;
    @JsonInclude({value: JsonIncludeType.ALWAYS})
    phones: string[];
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
  t.assert(jsonData.includes('0'));
  t.assert(jsonData.includes('John'));
  t.assert(jsonData.includes('dept'));
  t.assert(jsonData.includes('address'));
  t.assert(jsonData.includes('phones'));
  t.assert(jsonData.includes('otherInfo'));
});
