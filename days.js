let timeZone = ""

function newPerson(form){
  let name = form.firstName.value
  let lastName = form.lastName.value
  let d = form.date.value
  if (name){
    if (d){
      let dob = new Date(d+ " "+ timeZone)
      let days = Math.floor((Date.now() - dob)/86400000)
      let entry = {
        value: dob,
        firstName: name,
        lastName: lastName,
        dob: dob.toLocaleString("en-US", {year: "numeric", month: "short", day: "numeric"}),
        secs: (Math.round(days * 0.864)/10).toLocaleString(10)+"M",
        days: days,
      }
      table.add(entry)
      form.firstName.value = ""
      form.lastName.value = ""
      form.date.value = ""
      form.firstName.focus()
      document.getElementById("error").innerHTML = ""
    }
    else
      document.getElementById("error").innerHTML = "Please enter a date"
  }
  else
    document.getElementById("error").innerHTML = "Please enter a name"
}

function changeTimeZone(form){
  timeZone = form.timeZone.value
}


let table = new Vue({
  el: '#output',
  template: `
    <div>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>DOB</th>
            <th>Days</th>
            <th>Seconds</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(person, k) in people">
            <td>{{person.firstName}}</td>
            <td>{{person.lastName}}</td>
            <td>{{person.dob}}</td>
            <td>{{person.days.toLocaleString(10)}}</td>
            <td>{{person.secs}}</td>
            <td v-if="deleteMode">
              <button class="button-sm" @click="() => deleteItem(k)">delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="footer">
        <div class="avg">
          <span><b>Mean: </b>{{averageData.mean.toLocaleString(10)}} Days ({{Math.floor(averageData.mean/36.525)/10}} Years)</span>
          <span><b>Median: </b>{{averageData.median.toLocaleString(10)}} Days ({{Math.floor(averageData.median/36.525)/10}} Years)</span>
        </div>
        <a @click="deleteMode = !deleteMode">{{deleteMode ? "done deleting" : "delete items"}}</a>
        <a v-if="!deleteMode" @click="() => sort('age')">Sort by Age</a>
        <a v-if="!deleteMode" @click="() => sort('lastName')">Sort by Last Name</a>
        <a v-if="!deleteMode" @click="() => sort('firstName')">Sort by First Name</a>
        <a v-if="!deleteMode" @click="() => sort('reverse')">Reverse Table</a>
      </div>
    </div>
    `,
  data: {
    people: [],
    deleteMode: false,
    averageData: {mean: 1000, median: 1000}
  },
  mounted(){
    let p = localStorage.ageData || "[]"
    this.people = JSON.parse(p)
    this.getData(this.people, true)
  },
  methods: {
    add(entry) {
      this.people.unshift(entry)
      this.getData(this.people, false)
      localStorage.ageData = JSON.stringify(this.people)
    },
    deleteItem(id){
      if (confirm(`Are you sure you want to delete ${this.people[id].firstName} ${this.people[id].lastName}?`)){
        this.people.splice(id, 1)
        localStorage.ageData = JSON.stringify(this.people)
        this.getData(this.people, false)
      }
    },

    calculate(person){
      let days = Math.floor((Date.now() - Date.parse(person.value))/86400000)
      person.secs = (Math.round(days * 0.864)/10).toLocaleString(10)+"M"
      person.days = days
      return person
    },

    getData(people, calc){
      let sum = 0
      let ages = []
      for (let person of people){
        if (calc)
          person = this.calculate(person)
        sum += person.days
        ages.push(person.days)
      }
      if (calc)
        this.people = people
      ages.sort((a,b) => b-a)
      let m = Math.floor(ages.length/2)
      let median = ages.length % 2 == 0 ? Math.floor((ages[m]+ages[m-1])/2) : ages[m]
      this.averageData = {mean: Math.floor(sum/people.length), median}
    },

    sort(type){
      if (type === "age"){
        this.people = this.people.sort((a,b) => b.days-a.days)
      }
      else if (type === "firstName") {
        this.people = this.people.sort((a, b) => {
          let x = a.firstName.toLowerCase()
          let y = b.firstName.toLowerCase()
          return x > y ? 1 : y > x ? -1 : 0
        })
      }
      else if (type === "lastName") {
        this.people = this.people.sort((a, b) => {
          let x = a.lastName.toLowerCase()
          let y = b.lastName.toLowerCase()
          return x > y ? 1 : y > x ? -1 : 0
        })
      }
      else if (type === "reverse"){
        this.people = this.people.reverse()
      }
      else
        return
      localStorage.ageData = JSON.stringify(this.people)
    }
  }
})