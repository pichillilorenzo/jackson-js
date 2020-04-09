import test from 'ava';
import {JsonValue} from '../src/decorators/JsonValue';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClass} from '../src/decorators/JsonClass';

class Company {
  @JsonProperty()
  name: string;
  @JsonProperty()
  @JsonClass({class: () => [Array, [Employee]]})
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
  toPersonInfo(): string {
    return this.name + ' - ' + this.age;
  }
}

test('@JsonValue', t => {
  const company = new Company('Google');
  const employee = new Employee('John Alfa', 25);
  company.employees.push(employee);

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Employee>(employee);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('"John Alfa - 25"'));

  jsonData = objectMapper.stringify<Company>(company);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"employees":["John Alfa - 25"],"name":"Google"}'));
});
