import test from 'ava';
import {JsonFilter, JsonClass, ObjectMapper, JsonProperty, JsonFilterType} from '../src';

test('@JsonFilter on class', t => {

  @JsonFilter({name: 'studentFilter'})
  class Student {
    @JsonProperty({value: 'stdName'})
    name: string;
    age: number;
    college: string;
    city: string;

    constructor(name: string, age: number, college: string, city: string) {
      this.name = name;
      this.age = age;
      this.college = college;
      this.city = city;
    }
  }
  const student = new Student('Mohit', 30, 'ABCD', 'Varanasi');

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.SERIALIZE_ALL_EXCEPT,
        values: ['stdName', 'city']
      }
    }
  });

  t.assert(!jsonData.includes('Mohit'));
  t.assert(jsonData.includes('30'));
  t.assert(jsonData.includes('ABCD'));
  t.assert(!jsonData.includes('Varanasi'));

  jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.FILTER_OUT_ALL_EXCEPT,
        values: ['stdName', 'city']
      }
    }
  });

  t.assert(jsonData.includes('Mohit'));
  t.assert(!jsonData.includes('30'));
  t.assert(!jsonData.includes('ABCD'));
  t.assert(jsonData.includes('Varanasi'));

  jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.SERIALIZE_ALL
      }
    }
  });

  t.assert(jsonData.includes('Mohit'));
  t.assert(jsonData.includes('30'));
  t.assert(jsonData.includes('ABCD'));
  t.assert(jsonData.includes('Varanasi'));
});

test('@JsonFilter on class property', t => {
  class Company {
    name: string;

    @JsonFilter({name: 'ceoFilter'})
    @JsonClass({class: () => [Employee]})
    ceo: Employee;

    constructor(name: string, ceo: Employee) {
      this.name = name;
      this.ceo = ceo;
    }
  }

  class Employee {
    name: string;
    @JsonProperty({value: 'empAge'})
    age: number;

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
  }

  const ceo = new Employee('Tim Cook', 50);
  const company = new Company('Apple', ceo);

  const objectMapper = new ObjectMapper();

  let jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.SERIALIZE_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });

  t.assert(jsonData.includes('Apple'));
  t.assert(jsonData.includes('Tim Cook'));
  t.assert(!jsonData.includes('50'));

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.FILTER_OUT_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });

  t.assert(jsonData.includes('Apple'));
  t.assert(!jsonData.includes('Tim Cook'));
  t.assert(jsonData.includes('50'));

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.SERIALIZE_ALL
      }
    }
  });

  t.assert(jsonData.includes('Apple'));
  t.assert(jsonData.includes('Tim Cook'));
  t.assert(jsonData.includes('50'));
});
