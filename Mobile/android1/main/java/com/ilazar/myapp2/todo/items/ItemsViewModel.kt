package com.ilazar.myapp2.todo.items

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ilazar.myapp2.todo.data.ItemRepository
import com.ilazar.myapp2.core.TAG
import com.ilazar.myapp2.core.Result
import com.ilazar.myapp2.todo.data.Item
import kotlinx.coroutines.launch

class ItemListViewModel : ViewModel() {
    private val mutableItems = MutableLiveData<List<Item>>().apply { value = emptyList() }
    private val mutableLoading = MutableLiveData<Boolean>().apply { value = false }
    private val mutableException = MutableLiveData<Exception>().apply { value = null }

    val items: LiveData<List<Item>> = mutableItems
    val loading: LiveData<Boolean> = mutableLoading
    val loadingError: LiveData<Exception> = mutableException

    fun createItem(position: Int) {
        val list = mutableListOf<Item>()
        list.addAll(mutableItems.value!!)
        list.add(
            Item(
                _id = position.toString(),
                text = "Item $position",
                nume = "Nume $position",
                varsta = 20 + position // Exemplu de generare a unei vârste
            )
        )
        mutableItems.value = list
    }

    fun loadItems() {
        viewModelScope.launch {
            Log.v(TAG, "loadItems...")
            mutableLoading.value = true
            mutableException.value = null
            when (val result = ItemRepository.loadAll()) {
                is Result.Success -> {
                    Log.d(TAG, "loadItems succeeded")
                    mutableItems.value = result.data
                }
                is Result.Error -> {
                    Log.w(TAG, "loadItems failed", result.exception)
                    mutableException.value = result.exception
                }
            }
            mutableLoading.value = false
        }
    }
}
