import test from 'ava';
import {JsonProperty} from '../src/annotations/JsonProperty';
import {JsonFilter, JsonFilterType} from '../src/annotations/JsonFilter';
import {JsonClass} from '../src/annotations/JsonClass';
import {ObjectMapper} from '../src/databind/ObjectMapper';

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
  t.is(jsonData, '{"age":30,"college":"ABCD"}');

  jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.FILTER_OUT_ALL_EXCEPT,
        values: ['stdName', 'city']
      }
    }
  });
  t.is(jsonData, '{"stdName":"Mohit","city":"Varanasi"}');

  jsonData = objectMapper.stringify<Student>(student, {
    filters: {
      studentFilter: {
        type: JsonFilterType.SERIALIZE_ALL
      }
    }
  });
  t.is(jsonData, '{"stdName":"Mohit","age":30,"college":"ABCD","city":"Varanasi"}');
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
  t.is(jsonData, '{"name":"Apple","ceo":{"name":"Tim Cook"}}');

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.FILTER_OUT_ALL_EXCEPT,
        values: ['empAge']
      }
    }
  });
  t.is(jsonData, '{"name":"Apple","ceo":{"empAge":50}}');

  jsonData = objectMapper.stringify<Company>(company, {
    filters: {
      ceoFilter: {
        type: JsonFilterType.SERIALIZE_ALL
      }
    }
  });
  t.is(jsonData, '{"name":"Apple","ceo":{"name":"Tim Cook","empAge":50}}');
});
