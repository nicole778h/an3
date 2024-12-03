package com.ilazar.myapp2.todo.data

data class Item(
    val _id: String,
    var text: String,
    var nume: String,
    var varsta: Int
) {
    override fun toString(): String = text+nume+varsta
}
