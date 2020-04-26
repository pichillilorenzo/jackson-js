import test from 'ava';
import {JsonValue} from '../src/decorators/JsonValue';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {JacksonError} from '../src/core/JacksonError';

test('@JsonValue at property level', t => {
  class Company {
    @JsonProperty()
    name: string;
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Employee]]})
    employees: Employee[] = [];

    constructor(name: string) {
      this.name = name;
    }
  }

  class Employee {
    @JsonProperty()
    name: string;
    @JsonProperty()
    age: number;

    @JsonValue()
    @JsonProperty()
    employeeInfo = '';

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
      this.employeeInfo = this.name + ' - ' + this.age;
    }
  }

  const company = new Company('Google');
  const employee = new Employee('John Alfa', 25);
  company.employees.push(employee);

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('"John Alfa - 25"'));

  jsonData = objectMapper.stringify<Company>(company);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"employees":["John Alfa - 25"],"name":"Google"}'));
});

test('@JsonValue at method level', t => {
  class Company {
    @JsonProperty()
    name: string;
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Employee]]})
    employees: Employee[] = [];

    constructor(name: string) {
      this.name = name;
    }
  }

  class Employee {
    @JsonProperty()
    name: string;
    @JsonProperty()
    age: number;

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }

    @JsonValue()
    toEmployeeInfo(): string {
      return this.name + ' - ' + this.age;
    }
  }

  const company = new Company('Google');
  const employee = new Employee('John Alfa', 25);
  company.employees.push(employee);

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('"John Alfa - 25"'));

  jsonData = objectMapper.stringify<Company>(company);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"employees":["John Alfa - 25"],"name":"Google"}'));
});

test('Fail multiple @JsonValue on the same class', t => {
  const err = t.throws<JacksonError>(() => {
    class Company {
      @JsonProperty()
      name: string;
      @JsonProperty()
      @JsonClassType({type: () => [Array, [Employee]]})
      employees: Employee[] = [];

      constructor(name: string) {
        this.name = name;
      }
    }

    class Employee {
      @JsonProperty()
      name: string;
      @JsonProperty()
      age: number;

      @JsonValue()
      @JsonProperty()
      employeeInfo = '';

      constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
      }

      @JsonValue()
      toEmployeeInfo(): string {
        return this.name + ' - ' + this.age;
      }
    }
  });

  t.assert(err instanceof JacksonError);
});
