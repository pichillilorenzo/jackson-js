import test from 'ava';
import {JsonIgnore, JsonClass, ObjectMapper} from '../src';

class User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;

  @JsonClass({class: () => [Array, [Item]]})
  items: Item[] = [];

  constructor(id: number, email: string, firstname: string, lastname: string) {
    this.id = id;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
  }
}

class Item {
  id: number;
  name: string;

  @JsonIgnore()
  category: string;

  @JsonIgnore()
  owner: User;

  constructor(id: number, name: string, category: string, owner: User) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.owner = owner;
  }
}

test('@JsonIgnore', t => {
  const user = new User(1, 'john.alfa@gmail.com', 'John', 'Alfa');
  const item1 = new Item(1, 'Game Of Thrones', 'Book', user);
  const item2 = new Item(2, 'NVIDIA', 'Graphic Card', user);
  user.items.push(...[item1, item2]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.is(jsonData, '{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa","items":[{"id":1,"name":"Game Of Thrones"},{"id":2,"name":"NVIDIA"}]}');
});
