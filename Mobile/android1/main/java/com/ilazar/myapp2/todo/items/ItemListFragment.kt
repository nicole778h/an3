package com.ilazar.myapp2.todo.items

import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.fragment.findNavController
import com.ilazar.myapp2.R
import com.ilazar.myapp2.auth.data.AuthRepository
import com.ilazar.myapp2.core.TAG
import com.ilazar.myapp2.databinding.FragmentItemListBinding

class ItemListFragment : Fragment() {
    private var _binding: FragmentItemListBinding? = null
    private lateinit var itemListAdapter: ItemListAdapter
    private lateinit var itemsModel: ItemListViewModel
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        Log.i(TAG, "onCreateView")
        _binding = FragmentItemListBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        Log.i(TAG, "onViewCreated")

        // Verificăm dacă utilizatorul este autentificat
        if (!AuthRepository.isLoggedIn) {
            findNavController().navigate(R.id.FragmentLogin)
            return
        }

        // Configurăm lista de item-uri
        setupItemList()

        // Acțiune pentru butonul FloatingActionButton (adică adăugarea unui item nou)
        binding.fab.setOnClickListener {
            Log.v(TAG, "add new item")
            findNavController().navigate(R.id.ItemEditFragment)
        }
    }

    private fun setupItemList() {
        // Inițializare adapter
        itemListAdapter = ItemListAdapter(this)
        binding.itemList.adapter = itemListAdapter

        // Inițializare ViewModel pentru gestionarea item-urilor
        itemsModel = ViewModelProvider(this).get(ItemListViewModel::class.java)

        // Observăm lista de item-uri
        itemsModel.items.observe(viewLifecycleOwner, { value ->
            Log.i(TAG, "update items")
            itemListAdapter.items = value // Actualizăm datele în adapter
        })

        // Observăm starea de încărcare
        itemsModel.loading.observe(viewLifecycleOwner, { loading ->
            Log.i(TAG, "update loading")
            binding.progress.visibility = if (loading) View.VISIBLE else View.GONE
        })

        // Observăm eventualele erori la încărcare
        itemsModel.loadingError.observe(viewLifecycleOwner, { exception ->
            if (exception != null) {
                Log.i(TAG, "update loading error")
                val message = "Loading exception ${exception.message}"
                Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
            }
        })

        // Încărcăm lista de item-uri
        itemsModel.loadItems()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        Log.i(TAG, "onDestroyView")
        _binding = null
    }
}
