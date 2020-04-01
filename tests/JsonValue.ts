import test from 'ava';
import {JsonValue} from '../src/annotations/JsonValue';
import {ObjectMapper} from '../src/databind/ObjectMapper';

class Company {
  name: string;
  employees: Employee[] = [];

  constructor(name: string) {
    this.name = name;
  }
}

class Employee {
  name: string;
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
  t.is(jsonData, '"John Alfa - 25"');

  jsonData = objectMapper.stringify<Company>(company);
  t.is(jsonData, '{"name":"Google","employees":["John Alfa - 25"]}');
});
