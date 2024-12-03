package com.ilazar.myapp2.todo.data.remote

import com.ilazar.myapp2.core.Api
import com.ilazar.myapp2.todo.data.Item
import retrofit2.http.*

object ItemApi {
    interface Service {
        @GET("/api/item")
        suspend fun find(): List<Item>

        @GET("/api/item/{id}")
        suspend fun read(@Path("id") itemId: String): Item;

        @Headers("Content-Type: application/json")
        @POST("/api/item")
        suspend fun create(@Body item: Item): Item

        @Headers("Content-Type: application/json")
        @PUT("/api/item/{id}")
        suspend fun update(@Path("id") itemId: String, @Body item: Item): Item
    }

    val service: Service = Api.retrofit.create(Service::class.java)
}